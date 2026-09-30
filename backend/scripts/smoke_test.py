"""Offline smoke test for the PDF engines, QR generation, and numbering."""
from __future__ import annotations

import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import fitz

from db.database import Base, SessionLocal, engine
from db.models import NumberCounter
from services.numbering import initialize_counters, allocate_number
from services.qr_service import create_qr_image
from engines.invoice.engine import build_pdfs
from engines.quotation.engine import build

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    # Numbering smoke test on the configured SQLite database schema.
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        initialize_counters(db)
        inv = allocate_number(db, "invoice")
        quote = allocate_number(db, "quotation")
        db.rollback()  # Do not consume numbers during a smoke test.
        assert inv.startswith("MAX/") and inv.rsplit('/', 1)[-1].isdigit(), inv
        assert "/S" in quote and quote.rsplit('S', 1)[-1].isdigit(), quote
    finally:
        db.close()

    # QR direct-URL verification.
    url = "https://maxmoc.com/v/smoke-test-token"
    qr, ext = create_qr_image(url)
    assert ext == "png" and qr

    # Invoice engine regression input.
    invoice_input = ROOT.parent / "invoice_poc" / "invoice_poc" / "tests" / "data_new.json"
    if not invoice_input.exists():
        print("POC regression inputs not present; skipping full PDF regression section.")
        return
    invoice_data = json.loads(invoice_input.read_text())
    invoice_data["invoice_no"] = "MAX/2026/0074"
    invoice_data["customer"]["state_code"] = "29"
    invoice_data["customer"]["gstin"] = "29AABCS4939K1ZP"
    invoice_result = build_pdfs(invoice_data, qr_bytes=qr, qr_ext=ext, public_url=url)
    full = fitz.open(stream=invoice_result["pdfs"]["full"], filetype="pdf")
    public = fitz.open(stream=invoice_result["pdfs"]["public_page1"], filetype="pdf")
    assert len(full) == 2 and len(public) == 1

    # Quotation regression input.
    quote_data = json.loads((ROOT.parent / "quote_poc" / "quote_poc" / "tests" / "data_new.json").read_text())
    quote_data["quote_no"] = "MAX/2026/S0080"
    quote_data.pop("subject_dg_kva", None)
    quote_data.pop("subject_dg_qty", None)
    quote_data["subject"] = "MMW Retrofit Emission Control Device (RECD) for 500KVA DG Set - 2 Nos."
    quote_result = build(quote_data)
    qpdf = fitz.open(stream=quote_result["pdf"], filetype="pdf")
    assert len(qpdf) == 15
    qtext = "\n".join(p.get_text() for p in qpdf)
    for forbidden in ("Axis Bank", "UTIB0001991", "924020004674105", "Dindigul-624202"):
        assert forbidden not in qtext, forbidden
    assert "Dindigul-624303" in qtext
    assert "HDFC0001850" in qtext

    print("MMW backend smoke test: PASS")
    print(f"Invoice: {len(full)} pages; public snapshot: {len(public)} page")
    print(f"Quotation: {len(qpdf)} pages; total: {quote_result['total']}")


if __name__ == "__main__":
    main()
