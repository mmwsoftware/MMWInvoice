# MMW Document System Backend

FastAPI backend for MMW invoice and quotation generation. The existing PDF engines are preserved under `engines/` and use the measured MMW PDF templates.

## Current scope

- One `admin` account; password comes from `.env`.
- Calendar-year numbering:
  - Invoice: `MAX/YYYY/NNNN`
  - Quotation: `MAX/YYYY/SNNNN`
- Existing sequences continue from invoice 0073 and quotation S0079.
- Drafts have no document number.
- Issued documents receive a number and are immutable.
- Invoice QR points directly to `PUBLIC_BASE_URL/v/<token>`.
- Public invoice route serves only the page-1 snapshot.
- PDFs are stored on the VPS filesystem through a storage abstraction.
- Quotation page 11 uses the cleaned template with `Dindigul-624303` and only the HDFC bank details.

## Local development

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set a strong `ADMIN_PASSWORD` and `SECRET_KEY`.

Initialize the database:

```bash
alembic upgrade head
```

Run:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Swagger UI is available at `/docs` during development.

## Important production notes

- Put the API behind HTTPS/reverse proxy on the VPS.
- Do not expose `storage_data/` as a public static directory.
- Set `CORS_ORIGINS` to the actual React frontend origin instead of `*`.
- Keep `.env` out of source control.
- `QR_PROVIDER=local_test` is for development. Set `QR_PROVIDER=meqr` and configure `ME_QR_API_TOKEN` only after the ME-QR integration is tested with a real account.
- Same-state invoice CGST+SGST support is intentionally not implemented yet.
- Quotation continuation pages are intentionally not implemented yet.


Quotation page 2 dynamic fields: date, customer name/address, and the full subject text supplied by the user.
