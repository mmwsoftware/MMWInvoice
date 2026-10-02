"""Quotation business logic service.

Bridges the FastAPI layer with the existing quotation PDF engine.
Handles draft management, numbering, PDF generation, and storage.
"""
from __future__ import annotations

from datetime import datetime, date, timezone
from decimal import Decimal
import re

from sqlalchemy.orm import Session

from config import get_settings
from db.models import Quotation, QuotationItem, Customer, AuditLog, NumberCounter
from services.numbering import allocate_number, peek_next_number
from storage.local import LocalStorage


def _get_storage() -> LocalStorage:
    settings = get_settings()
    return LocalStorage(settings.STORAGE_DIR)


def _audit(db: Session, entity_type: str, entity_id: int,
           action: str, details: dict | None = None) -> None:
    db.add(AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        details=details,
        performed_by="admin",
    ))


# ──────────────────────────────────────────────────────────
# Generate / issue
# ──────────────────────────────────────────────────────────

def _resolve_quotation_number(db: Session, requested: str | None) -> str:
    """Return a validated quotation number and keep the counter in sync."""
    if requested and requested.strip():
        number = requested.strip()
        match = re.fullmatch(r"MAX/(\d{4})/S(\d{4})", number)
        if not match:
            raise ValueError("Invalid quotation number. Expected MAX/YYYY/S0001 format.")

        existing = db.query(Quotation).filter(Quotation.quotation_number == number).first()
        if existing:
            raise ValueError(f"Quotation number '{number}' is already in use.")

        year = int(match.group(1))
        sequence = int(match.group(2))
        counter = db.query(NumberCounter).filter(
            NumberCounter.doc_type == "quotation",
            NumberCounter.year == year,
        ).first()
        if counter is None:
            db.add(NumberCounter(doc_type="quotation", year=year, last_number=sequence))
        elif counter.last_number < sequence:
            counter.last_number = sequence
        return number

    return allocate_number(db, "quotation")


def generate_quotation(db: Session, data: dict) -> Quotation:
    """Create, generate, store, and issue a quotation in one transaction."""
    customer_id = data.get("customer_id")
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise ValueError("Customer not found")

    items_data = data.get("items", [])
    if not items_data:
        raise ValueError("Quotation has no items")

    quotation = Quotation(status="issued", customer_id=customer_id)
    _update_quotation_fields(quotation, data)
    db.add(quotation)
    db.flush()
    _add_items(db, quotation, items_data)
    db.flush()

    storage = _get_storage()
    created_paths: list[str] = []

    try:
        quotation_number = _resolve_quotation_number(db, data.get("quotation_number"))
        quotation.quotation_number = quotation_number

        engine_data = _build_engine_data(quotation, customer, db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).order_by(QuotationItem.serial_number).all())
        from engines.quotation.engine import build
        result = build(engine_data)

        safe_name = quotation_number.replace("/", "-")
        pdf_path = f"quotations/{safe_name}/{safe_name}_quotation.pdf"
        storage.save_pdf(result["pdf"], pdf_path)
        created_paths.append(pdf_path)

        quotation.total_amount = result["total"]
        quotation.amount_words = result["words"]
        quotation.subtotal = result["total"]
        quotation.pdf_path = pdf_path
        quotation.status = "issued"
        quotation.issued_at = datetime.now(timezone.utc)

        _audit(db, "quotation", quotation.id, "issued", {
            "quotation_number": quotation_number,
            "total": str(result["total"]),
            "warnings": result.get("warnings", []),
        })

        db.commit()
        db.refresh(quotation)
        return quotation

    except Exception:
        db.rollback()
        for path in reversed(created_paths):
            try:
                storage.delete(path)
            except Exception:
                pass
        raise


def preview_quotation_pdf(db: Session, data: dict) -> bytes:
    """Render the quotation PDF from form data WITHOUT saving anything.

    No database rows, files or document numbers are created. The number shown is
    the one the user typed, or the next number that would be assigned.
    """
    items = data.get("items") or []
    if not items:
        raise ValueError("Quotation has no items")

    customer = data.get("customer") or {}
    number = (data.get("quotation_number") or "").strip() or peek_next_number(db, "quotation")

    try:
        q_date = date.fromisoformat(str(data.get("quotation_date")))
    except ValueError:
        raise ValueError("Invalid quotation date. Expected YYYY-MM-DD.")

    engine_data = {
        "quote_no": number,
        "date": q_date.isoformat(),
        "subject": str(data.get("subject") or "").strip(),
        "customer": {
            "name": customer.get("name") or "",
            "address_lines": customer.get("address_lines") or [],
            "gstin": (customer.get("gstin") or "").strip().upper(),
        },
        "items": [
            {
                "description": it["description"],
                "hsn": it.get("hsn_code", it.get("hsn", "")) or "",
                "uom": it.get("uom") or "Nos",
                "qty": it["qty"],
                "rate": it["rate"],
            }
            for it in items
        ],
    }

    from engines.quotation.engine import build
    return build(engine_data)["pdf"]


def _update_quotation_fields(quotation: Quotation, data: dict) -> None:
    quotation.customer_id = data.get("customer_id", quotation.customer_id)
    q_date = data.get("quotation_date")
    if isinstance(q_date, str):
        quotation.quotation_date = date.fromisoformat(q_date)
    elif isinstance(q_date, date):
        quotation.quotation_date = q_date
    quotation.subject = str(data.get("subject", quotation.subject or "")).strip() or None


def _add_items(db: Session, quotation: Quotation, items: list[dict]) -> None:
    for idx, item_data in enumerate(items, start=1):
        qty = Decimal(str(item_data["qty"]))
        rate = Decimal(str(item_data["rate"]))
        amount = (qty * rate).quantize(Decimal("0.01"))
        db.add(QuotationItem(
            quotation_id=quotation.id,
            serial_number=idx,
            description=item_data["description"],
            hsn=item_data.get("hsn_code", item_data.get("hsn", "")),
            qty=float(qty),
            uom=item_data.get("uom", "Nos"),
            rate=rate,
            amount=amount,
        ))


def _build_engine_data(
    quotation: Quotation,
    customer: Customer,
    items: list[QuotationItem],
) -> dict:
    """Build the data dict expected by the quotation engine's build()."""
    q_date = quotation.quotation_date
    if isinstance(q_date, str):
        q_date = date.fromisoformat(q_date)

    # Build address lines for page 2 (letter format, up to 5 lines)
    address_lines = customer.address_lines or []

    # Build items in engine format
    engine_items = []
    for item in items:
        engine_items.append({
            "description": item.description,
            "hsn": item.hsn or "",
            "uom": item.uom or "Nos",
            "qty": item.qty,
            "rate": float(item.rate),
        })

    data = {
        "quote_no": quotation.quotation_number,
        "date": q_date.isoformat() if isinstance(q_date, date) else str(q_date),
        "subject": quotation.subject,
        "customer": {
            "name": customer.name,
            "address_lines": address_lines,
            "gstin": customer.gstin or "",
        },
        "items": engine_items,
    }

    # Add page9 address override if customer has it
    if customer.page9_address_lines:
        data["customer"]["page9_address_lines"] = customer.page9_address_lines

    return data


# ──────────────────────────────────────────────────────────
# Query operations
# ──────────────────────────────────────────────────────────

def get_quotation(db: Session, quotation_id: int) -> Quotation | None:
    return db.query(Quotation).filter(Quotation.id == quotation_id).first()


def list_quotations(
    db: Session,
    *,
    status: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Quotation]:
    q = db.query(Quotation).join(Customer)
    if status:
        q = q.filter(Quotation.status == status)
    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.filter(Quotation.quotation_number.ilike(term) | Customer.name.ilike(term) | Quotation.subject.ilike(term))
    return q.order_by(Quotation.id.desc()).offset(skip).limit(limit).all()


def get_quotation_pdf(db: Session, quotation_id: int) -> bytes:
    """Retrieve PDF bytes for a quotation."""
    quotation = get_quotation(db, quotation_id)
    if not quotation:
        raise ValueError("Quotation not found")
    if quotation.status != "issued":
        raise ValueError("Quotation has not been issued yet")

    storage = _get_storage()
    if not quotation.pdf_path:
        raise ValueError("PDF not found")
    return storage.get_pdf(quotation.pdf_path)


def delete_quotation(db: Session, quotation_id: int) -> None:
    quotation = get_quotation(db, quotation_id)
    if not quotation:
        raise ValueError("Quotation not found")

    storage = _get_storage()

    try:
        if quotation.pdf_path:
            storage.delete(quotation.pdf_path)

        db.query(QuotationItem).filter(
            QuotationItem.quotation_id == quotation_id
        ).delete(synchronize_session=False)
        _audit(db, "quotation", quotation_id, "deleted", {
            "quotation_number": quotation.quotation_number,
        })
        db.delete(quotation)
        db.commit()
    except Exception:
        db.rollback()
        raise
