"""Invoice API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from datetime import datetime
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.database import get_db
from api.auth import get_current_user
from services import invoice_service


router = APIRouter()


# ── Pydantic schemas ─────────────────────────────────────

class InvoiceItemCreate(BaseModel):
    description: str
    hsn: str = ""
    qty: float
    uom: str = "Nos."
    rate: float


class InvoiceDraftCreate(BaseModel):
    customer_id: int
    invoice_date: str = Field(..., description="DD.MM.YYYY or YYYY-MM-DD format")
    po_number: str | None = None
    po_date: str | None = None
    engineer_name: str | None = None
    engineer_email: str | None = None
    engineer_contact: str | None = None
    copy_type: str = "original"
    gst_rate: float = 18.0
    items: list[InvoiceItemCreate]
    invoice_number: str | None = None


class InvoiceItemResponse(BaseModel):
    id: int
    serial_number: int
    description: str
    hsn: str | None
    qty: float
    uom: str | None
    rate: float
    amount: float

    model_config = {"from_attributes": True}


class CustomerBriefResponse(BaseModel):
    id: int
    name: str
    gstin: str | None = None
    address_lines: list[str] = []

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str | None
    customer_id: int
    invoice_date: str | None
    po_number: str | None
    po_date: str | None
    engineer_name: str | None
    copy_type: str | None
    gst_rate: float | None
    subtotal: float | None
    tax_amount: float | None
    total_amount: float | None
    amount_words: str | None
    public_token: str | None
    status: str
    issued_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None
    items: list[InvoiceItemResponse] = []
    customer: CustomerBriefResponse | None = None

    model_config = {"from_attributes": True}


# ── Endpoints ─────────────────────────────────────────────

@router.post("", response_model=InvoiceResponse)
def create_or_update_draft(
    data: InvoiceDraftCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Save a draft invoice (no number assigned yet)."""
    try:
        invoice = invoice_service.save_draft(db, data.model_dump())
        return invoice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{invoice_id}/issue", response_model=InvoiceResponse)
def issue(
    invoice_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Assign a number, generate PDF, and lock the invoice."""
    try:
        invoice = invoice_service.issue_invoice(db, invoice_id)
        return invoice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")


@router.get("", response_model=list[InvoiceResponse])
def list_invoices(
    status: str | None = Query(
        None,
        description="Filter by status: draft, issued",
    ),
    search: str | None = Query(
        None,
        description="Search by invoice number or customer name",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """List invoices with optional status filter, search and pagination."""
    return invoice_service.list_invoices(
        db,
        status=status,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/next-number")
def get_next_invoice_number(
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Peek the next auto-generated invoice number without consuming it."""
    from services.numbering import peek_next_number
    next_num = peek_next_number(db, "invoice")
    return {"next_number": next_num}


@router.get("/check-number")
def check_invoice_number(
    number: str = Query(..., min_length=1),
    invoice_id: int | None = Query(None),
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Check if an invoice number is available or already used."""
    from db.models import Invoice
    q = db.query(Invoice).filter(Invoice.invoice_number == number.strip())
    if invoice_id:
        q = q.filter(Invoice.id != invoice_id)
    exists = q.first() is not None
    return {"available": not exists, "number": number.strip()}


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Get a single invoice by ID."""
    invoice = invoice_service.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Download the full private 2-page invoice PDF."""
    try:
        pdf_bytes = invoice_service.get_invoice_pdf(db, invoice_id, public=False)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=invoice_{invoice_id}.pdf"},
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{invoice_id}/preview-pdf")
def get_invoice_preview_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Generate and stream a preview of the invoice PDF for drafts."""
    try:
        pdf_bytes = invoice_service.preview_invoice_pdf(db, invoice_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=preview_invoice_{invoice_id}.pdf"},
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF preview generation failed: {e}")


@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_draft(
    invoice_id: int,
    data: InvoiceDraftCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Update an existing draft invoice."""
    try:
        update_data = data.model_dump()
        update_data["id"] = invoice_id
        invoice = invoice_service.save_draft(db, update_data)
        return invoice
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Delete an invoice, its items, and its PDF from disk."""
    try:
        invoice_service.delete_invoice(db, invoice_id)
        return {"success": True, "message": f"Invoice {invoice_id} deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete invoice: {e}")
