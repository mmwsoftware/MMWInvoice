"""Quotation business logic service.

Bridges the FastAPI layer with the existing quotation PDF engine.
Handles draft management, numbering, PDF generation, and storage.
"""
from __future__ import annotations

from datetime import datetime, date, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from config import get_settings
from db.models import Quotation, QuotationItem, Customer, AuditLog
from services.numbering import allocate_number
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
# Draft operations
# ──────────────────────────────────────────────────────────

def save_draft(db: Session, data: dict) -> Quotation:
    """Create or update a draft quotation."""
    quotation_id = data.get("id")
    customer_id = data.get("customer_id")
    if not customer_id or not db.query(Customer).filter(Customer.id == customer_id).first():
        raise ValueError("Customer not found")

    if quotation_id:
        quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if not quotation:
            raise ValueError(f"Quotation {quotation_id} not found")
        if quotation.status != "draft":
            raise ValueError("Cannot modify an issued quotation.")
        _update_quotation_fields(db, quotation, data)
        db.query(QuotationItem).filter(
            QuotationItem.quotation_id == quotation.id
        ).delete()
        _add_items(db, quotation, data.get("items", []))
    else:
        quotation = Quotation(
            status="draft",
            customer_id=data["customer_id"],
        )
        _update_quotation_fields(db, quotation, data)
        db.add(quotation)
        db.flush()
        _add_items(db, quotation, data.get("items", []))

    db.commit()
    db.refresh(quotation)
    _audit(db, "quotation", quotation.id, "draft_saved")
    db.commit()
    return quotation


def _update_quotation_fields(db: Session, quotation: Quotation, data: dict) -> None:
    quotation.customer_id = data.get("customer_id", quotation.customer_id)
    q_date = data.get("quotation_date")
    if isinstance(q_date, str):
        quotation.quotation_date = date.fromisoformat(q_date)
    elif isinstance(q_date, date):
        quotation.quotation_date = q_date
    quotation.subject = str(data.get("subject", quotation.subject or "")).strip() or None
    q_num = data.get("quotation_number")
    if q_num and str(q_num).strip():
        desired_num = str(q_num).strip()
        existing = db.query(Quotation).filter(
            Quotation.quotation_number == desired_num,
            Quotation.id != quotation.id
        ).first()
        if existing:
            raise ValueError(f"Quotation number '{desired_num}' is already in use by another quotation.")
        quotation.quotation_number = desired_num


def _add_items(db: Session, quotation: Quotation, items: list[dict]) -> None:
    for idx, item_data in enumerate(items, start=1):
        qty = Decimal(str(item_data["qty"]))
        rate = Decimal(str(item_data["rate"]))
        amount = (qty * rate).quantize(Decimal("0.01"))

        item = QuotationItem(
            quotation_id=quotation.id,
            serial_number=idx,
            description=item_data["description"],
            hsn=item_data.get("hsn", ""),
            qty=float(qty),
            uom=item_data.get("uom", "Nos"),
            rate=rate,
            amount=amount,
        )
        db.add(item)


# ──────────────────────────────────────────────────────────
# Issue (generate number + PDF)
# ──────────────────────────────────────────────────────────

def issue_quotation(db: Session, quotation_id: int) -> Quotation:
    """Assign a number, generate/store the PDF, and atomically issue the quotation.

    Database changes and number allocation are committed only after PDF generation
    and storage succeed. Any failure rolls the SQLAlchemy transaction back and
    removes the PDF written during the failed attempt.
    """
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise ValueError(f"Quotation {quotation_id} not found")
    if quotation.status == "issued":
        raise ValueError(f"Quotation {quotation_id} is already issued")

    customer = db.query(Customer).filter(Customer.id == quotation.customer_id).first()
    if not customer:
        raise ValueError("Customer not found")

    items = (
        db.query(QuotationItem)
        .filter(QuotationItem.quotation_id == quotation.id)
        .order_by(QuotationItem.serial_number)
        .all()
    )
    if not items:
        raise ValueError("Quotation has no items")

    storage = _get_storage()
    created_paths: list[str] = []

    try:
        if not quotation.quotation_number:
            quotation_number = allocate_number(db, "quotation")
            quotation.quotation_number = quotation_number
        else:
            existing = db.query(Quotation).filter(
                Quotation.quotation_number == quotation.quotation_number,
                Quotation.id != quotation.id
            ).first()
            if existing:
                raise ValueError(f"Quotation number '{quotation.quotation_number}' is already in use.")
            quotation_number = quotation.quotation_number

        engine_data = _build_engine_data(quotation, customer, items)

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


def _build_engine_data(
    quotation: Quotation,
    customer: Customer,
    items: list[QuotationItem],
    db: Session | None = None,
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

    quote_num = quotation.quotation_number
    if not quote_num and db is not None:
        try:
            from services.numbering import peek_next_number
            quote_num = peek_next_number(db, "quotation")
        except Exception:
            quote_num = None

    if not quote_num:
        quote_num = f"MAX/{date.today().year}/0001"

    data = {
        "quote_no": quote_num,
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


def preview_quotation_pdf(db: Session, quotation_id: int) -> bytes:
    """Generate in-memory preview of quotation PDF without committing number or locking."""
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise ValueError(f"Quotation {quotation_id} not found")

    customer = db.query(Customer).filter(Customer.id == quotation.customer_id).first()
    if not customer:
        raise ValueError("Customer not found")

    items = (
        db.query(QuotationItem)
        .filter(QuotationItem.quotation_id == quotation.id)
        .order_by(QuotationItem.serial_number)
        .all()
    )
    if not items:
        raise ValueError("Quotation has no items")

    engine_data = _build_engine_data(quotation, customer, items, db=db)
    from engines.quotation.engine import build
    result = build(engine_data)
    return result["pdf"]


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
        q = q.filter(
            Quotation.quotation_number.ilike(term)
            | Customer.name.ilike(term)
            | Quotation.subject.ilike(term)
        )

    return (
        q.order_by(Quotation.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

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


def delete_quotation(db: Session, quotation_id: int) -> bool:
    """Delete a quotation, its items, and its PDF from disk."""
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise ValueError(f"Quotation {quotation_id} not found")

    # If it has a generated PDF file on disk, delete it
    if quotation.pdf_path:
        storage = _get_storage()
        try:
            storage.delete(quotation.pdf_path)
        except Exception:
            pass

    # Delete quotation items
    db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).delete()

    # Log audit
    _audit(
        db,
        "quotation",
        quotation.id,
        "quotation_deleted",
        details={"quotation_number": quotation.quotation_number, "status": quotation.status},
    )

    # Delete the quotation row
    db.delete(quotation)
    db.commit()
    return True
