"""MMW Document System API - FastAPI entry point."""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from db.models import *  # noqa: F401 - ensure all models are loaded for create_all
from services.numbering import initialize_counters
from db.database import SessionLocal
from config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed counters."""
    Base.metadata.create_all(bind=engine)
    # Initialize number counters if they don't exist
    db = SessionLocal()
    try:
        initialize_counters(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="MMW Document System API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS (allow all for dev; tighten for production)
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.CORS_ORIGINS.split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from api.auth import router as auth_router
from api.invoices import router as invoices_router
from api.quotations import router as quotations_router
from api.customers import router as customers_router
from api.public import router as public_router

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(invoices_router, prefix="/api/invoices", tags=["invoices"])
app.include_router(quotations_router, prefix="/api/quotations", tags=["quotations"])
app.include_router(customers_router, prefix="/api/customers", tags=["customers"])
app.include_router(public_router, tags=["public"])


@app.get("/api/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
