"""Public invoice access endpoint.

GET /v/{token} serves the page-1-only public PDF.
This NEVER exposes the full 2-page private invoice.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from db.database import get_db
from services.invoice_service import get_public_invoice_pdf


router = APIRouter()


@router.get("/v/{token}")
def public_invoice(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Public invoice viewer.

    Returns ONLY the page-1 public snapshot PDF.
    The full 2-page private invoice is never reachable from this route.
    Unknown or revoked tokens return 404.
    """
    try:
        pdf_bytes = get_public_invoice_pdf(db, token)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "inline; filename=invoice.pdf"},
        )
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found or link is no longer valid",
        )
