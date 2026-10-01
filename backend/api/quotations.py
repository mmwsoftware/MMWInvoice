"""Quotation API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from datetime import date, datetime
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.database import get_db
from api.auth import get_current_user
from services import quotation_service


router = APIRouter()


# ── Pydantic schemas ─────────────────────────────────────

class QuotationItemCreate(BaseModel):
    description: str
    hsn: str = Field("", alias="hsn_code")
    qty: float
    uom: str = "Nos"
    rate: float

    model_config = {"populate_by_name": True}


class QuotationDraftCreate(BaseModel):
    customer_id: int
    quotation_date: str = Field(..., description="ISO format: YYYY-MM-DD")
    subject: str = Field(..., min_length=1, max_length=500, description="Full quotation subject text")
    items: list[QuotationItemCreate]
    quotation_number: str | None = None


class QuotationPreviewCustomer(BaseModel):
    name: str
    address_lines: list[str] = []
    gstin: str | None = None


class QuotationPreviewRequest(BaseModel):
    """Form data rendered as a PDF without saving anything."""
    customer: QuotationPreviewCustomer
    quotation_date: str = Field(..., description="ISO format: YYYY-MM-DD")
    subject: str = Field(..., min_length=1, max_length=500)
    items: list[QuotationItemCreate]
    quotation_number: str | None = None


class QuotationItemResponse(BaseModel):
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


class QuotationResponse(BaseModel):
    id: int
    quotation_number: str | None
    customer_id: int
    quotation_date: date | None
    subject: str | None
    subtotal: float | None
    total_amount: float | None
    amount_words: str | None
    status: str
    issued_at: datetime | None
    created_at: datetime | None
    updated_at: datetime | None
    items: list[QuotationItemResponse] = []
    customer: CustomerBriefResponse | None = None

    model_config = {"from_attributes": True}


# ── Endpoints ─────────────────────────────────────────────

@router.post("", response_model=QuotationResponse)
def create_quotation(
    data: QuotationDraftCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Generate and issue a quotation in one operation. No drafts are created."""
    try:
        return quotation_service.generate_quotation(db, data.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")


@router.post("/preview")
def preview_quotation(
    data: QuotationPreviewRequest,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Render the real quotation PDF from form data. Saves nothing, uses no number."""
    from engines.quotation.engine import FieldOverflow
    try:
        pdf_bytes = quotation_service.preview_quotation_pdf(db, data.model_dump())
    except (ValueError, FieldOverflow) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF preview failed: {e}")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "inline; filename=quotation_preview.pdf",
            "Cache-Control": "no-store",
        },
    )


@router.get("", response_model=list[QuotationResponse])
def list_quotations(
    status: str | None = Query(
        None,
        description="Filter by status: issued",
    ),
    search: str | None = Query(
        None,
        description="Search by quotation number, customer name or subject",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """List quotations with optional status filter, search and pagination."""
    return quotation_service.list_quotations(
        db,
        status=status,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/next-number")
def get_next_quotation_number(
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Peek the next auto-generated quotation number without consuming it."""
    from services.numbering import peek_next_number
    next_num = peek_next_number(db, "quotation")
    return {"next_number": next_num}


@router.get("/check-number")
def check_quotation_number(
    number: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Check if a quotation number is available or already used."""
    from db.models import Quotation
    q = db.query(Quotation).filter(Quotation.quotation_number == number.strip())
    exists = q.first() is not None
    return {"available": not exists, "number": number.strip()}


@router.get("/{quotation_id}", response_model=QuotationResponse)
def get_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Get a single quotation by ID."""
    quotation = quotation_service.get_quotation(db, quotation_id)
    if not quotation:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quotation


@router.get("/{quotation_id}/pdf")
def get_quotation_pdf(
    quotation_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Download the quotation PDF."""
    try:
        pdf_bytes = quotation_service.get_quotation_pdf(db, quotation_id)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=quotation_{quotation_id}.pdf"
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{quotation_id}")
def delete_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Delete a quotation, its items, and its PDF from disk."""
    try:
        quotation_service.delete_quotation(db, quotation_id)
        return {"success": True, "message": f"Quotation {quotation_id} deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete quotation: {e}")
