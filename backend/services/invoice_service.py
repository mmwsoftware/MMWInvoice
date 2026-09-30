"""Invoice business logic service.

Bridges the FastAPI layer with the existing invoice PDF engine.
Handles draft management, numbering, PDF generation, and storage.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from config import get_settings
from db.models import (
    Invoice, InvoiceItem, Customer, PublicLink, AuditLog
)
from services.numbering import allocate_number
from services.qr_service import generate_public_token, build_public_url, create_qr_image
from storage.local import LocalStorage


def _get_storage() -> LocalStorage:
    settings = get_settings()
    return LocalStorage(settings.STORAGE_DIR)


def _audit(db: Session, entity_type: str, entity_id: int,
           action: str, details: dict | None = None) -> None:
    """Write an audit log entry."""
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

def save_draft(db: Session, data: dict) -> Invoice:
    """Create or update a draft invoice. No number assigned yet."""
    invoice_id = data.get("id")
    customer_id = data.get("customer_id")
    if not customer_id or not db.query(Customer).filter(Customer.id == customer_id).first():
        raise ValueError("Customer not found")

    if invoice_id:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise ValueError(f"Invoice {invoice_id} not found")
        if invoice.status != "draft":
            raise ValueError("Cannot modify an issued invoice. Create a new one.")
        # Update existing draft
        _update_invoice_fields(invoice, data)
        # Replace items
        db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).delete()
        _add_items(db, invoice, data.get("items", []))
    else:
        # Create new draft
        invoice = Invoice(
            status="draft",
            customer_id=data["customer_id"],
        )
        _update_invoice_fields(invoice, data)
        db.add(invoice)
        db.flush()  # Get the ID
        _add_items(db, invoice, data.get("items", []))

    db.commit()
    db.refresh(invoice)
    _audit(db, "invoice", invoice.id, "draft_saved")
    db.commit()
    return invoice


def _update_invoice_fields(invoice: Invoice, data: dict) -> None:
    """Update invoice fields from input data."""
    invoice.customer_id = data.get("customer_id", invoice.customer_id)
    invoice.invoice_date = data.get("invoice_date", invoice.invoice_date)
    invoice.po_number = data.get("po_number")
    invoice.po_date = data.get("po_date")
    invoice.engineer_name = data.get("engineer_name")
    invoice.engineer_email = data.get("engineer_email")
    invoice.engineer_contact = data.get("engineer_contact")
    invoice.copy_type = data.get("copy_type", "original")
    invoice.gst_rate = data.get("gst_rate", 18.0)


def _add_items(db: Session, invoice: Invoice, items: list[dict]) -> None:
    """Add line items to an invoice."""
    for idx, item_data in enumerate(items, start=1):
        qty = Decimal(str(item_data["qty"]))
        rate = Decimal(str(item_data["rate"]))
        amount = (qty * rate).quantize(Decimal("0.01"))

        item = InvoiceItem(
            invoice_id=invoice.id,
            serial_number=idx,
            description=item_data["description"],
            hsn=item_data.get("hsn", ""),
            qty=float(qty),
            uom=item_data.get("uom", "Nos."),
            rate=rate,
            amount=amount,
        )
        db.add(item)


# ──────────────────────────────────────────────────────────
# Issue (generate number + PDF)
# ──────────────────────────────────────────────────────────

def issue_invoice(db: Session, invoice_id: int) -> Invoice:
    """Assign a number, generate/store PDFs, and atomically issue the invoice.

    Database changes and number allocation are committed only after PDF generation
    and storage succeed. Any failure rolls the SQLAlchemy transaction back and
    removes PDFs written during the failed attempt.
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise ValueError(f"Invoice {invoice_id} not found")
    if invoice.status == "issued":
        raise ValueError(f"Invoice {invoice_id} is already issued")

    customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
    if not customer:
        raise ValueError("Customer not found")

    items = (
        db.query(InvoiceItem)
        .filter(InvoiceItem.invoice_id == invoice.id)
        .order_by(InvoiceItem.serial_number)
        .all()
    )
    if not items:
        raise ValueError("Invoice has no items")

    storage = _get_storage()
    created_paths: list[str] = []

    try:
        # Everything below stays in the caller's transaction until the final commit.
        invoice_number = allocate_number(db, "invoice")
        invoice.invoice_number = invoice_number

        token = generate_public_token()
        invoice.public_token = token
        public_url = build_public_url(token)

        qr_bytes, qr_ext = create_qr_image(public_url)
        engine_data = _build_engine_data(invoice, customer, items)

        from engines.invoice.engine import build_pdfs
        result = build_pdfs(
            engine_data,
            qr_bytes=qr_bytes,
            qr_ext=qr_ext,
            public_url=public_url,
        )

        safe_name = invoice_number.replace("/", "-")
        private_path = f"invoices/{safe_name}/{safe_name}_full.pdf"
        public_path = f"invoices/{safe_name}/{safe_name}_public_page1.pdf"

        full_pdf = result["pdfs"]["full"]
        public_pdf = result["pdfs"]["public_page1"]
        storage.save_pdf(full_pdf, private_path)
        created_paths.append(private_path)
        storage.save_pdf(public_pdf, public_path)
        created_paths.append(public_path)

        computed = result["computed"]
        invoice.subtotal = computed["subtotal"]
        invoice.tax_amount = computed["tax"]
        invoice.total_amount = computed["total"]
        invoice.amount_words = computed["words"]
        invoice.private_pdf_path = private_path
        invoice.public_pdf_path = public_path
        invoice.private_pdf_sha256 = hashlib.sha256(full_pdf).hexdigest()
        invoice.public_pdf_sha256 = hashlib.sha256(public_pdf).hexdigest()
        invoice.status = "issued"
        invoice.issued_at = datetime.now(timezone.utc)

        db.add(PublicLink(
            token=token,
            invoice_id=invoice.id,
            is_active=True,
        ))

        _audit(db, "invoice", invoice.id, "issued", {
            "invoice_number": invoice_number,
            "total": str(computed["total"]),
            "public_token": token,
            "font_substitutes": result.get("font_substitutes", {}),
        })

        # Commit only after all DB and filesystem work has succeeded.
        db.commit()
        db.refresh(invoice)
        return invoice

    except Exception:
        # Undo the number/document/public-link DB changes.
        db.rollback()
        # Undo filesystem side effects from this failed attempt.
        for path in reversed(created_paths):
            try:
                storage.delete(path)
            except Exception:
                pass
        raise


def _build_engine_data(
    invoice: Invoice,
    customer: Customer,
    items: list[InvoiceItem],
) -> dict:
    """Build the data dict expected by the invoice engine's build_pdfs()."""
    return {
        "invoice_no": invoice.invoice_number,
        "invoice_date": invoice.invoice_date,
        "po_no": invoice.po_number or "",
        "po_date": invoice.po_date or "",
        "copy_type": invoice.copy_type or "original",
        "gst_rate": invoice.gst_rate or 18,
        "engineer": {
            "name": invoice.engineer_name or "",
            "email": invoice.engineer_email or "",
            "contact": invoice.engineer_contact or "",
        },
        "customer": {
            "name": customer.name,
            "address_lines": customer.address_lines or [],
            "state_code": customer.state_code or "",
            "gstin": customer.gstin or "",
        },
        "items": [
            {
                "description": item.description,
                "hsn": item.hsn or "",
                "qty": item.qty,
                "uom": item.uom or "Nos.",
                "rate": float(item.rate),
            }
            for item in items
        ],
    }


# ──────────────────────────────────────────────────────────
# Query operations
# ──────────────────────────────────────────────────────────

def get_invoice(db: Session, invoice_id: int) -> Invoice | None:
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()


def list_invoices(
    db: Session,
    *,
    status: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Invoice]:
    q = db.query(Invoice).join(Customer)

    if status:
        q = q.filter(Invoice.status == status)

    if search and search.strip():
        term = f"%{search.strip()}%"
        q = q.filter(
            Invoice.invoice_number.ilike(term)
            | Customer.name.ilike(term)
        )

    return (
        q.order_by(Invoice.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_invoice_pdf(db: Session, invoice_id: int, public: bool = False) -> bytes:
    """Retrieve PDF bytes for an invoice."""
    invoice = get_invoice(db, invoice_id)
    if not invoice:
        raise ValueError("Invoice not found")
    if invoice.status != "issued":
        raise ValueError("Invoice has not been issued yet")

    storage = _get_storage()
    path = invoice.public_pdf_path if public else invoice.private_pdf_path
    if not path:
        raise ValueError("PDF not found")
    return storage.get_pdf(path)


def get_public_invoice_pdf(db: Session, token: str) -> bytes:
    """Retrieve the public page-1 PDF by token. NEVER returns the full PDF."""
    link = (
        db.query(PublicLink)
        .filter(PublicLink.token == token, PublicLink.is_active == True)
        .first()
    )
    if not link:
        raise ValueError("Invalid or expired link")

    invoice = get_invoice(db, link.invoice_id)
    if not invoice or not invoice.public_pdf_path:
        raise ValueError("Invoice not found")

    storage = _get_storage()
    link.access_count += 1
    link.last_accessed_at = datetime.now(timezone.utc)
    db.commit()
    return storage.get_pdf(invoice.public_pdf_path)
