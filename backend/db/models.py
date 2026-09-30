from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Any

from sqlalchemy import Integer, String, DateTime, JSON, Float, Numeric, Boolean, Date, Text, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address_lines: Mapped[Any] = mapped_column(JSON, nullable=False)
    page9_address_lines: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    state_code: Mapped[Optional[str]] = mapped_column(String(2), nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    contact_person: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    invoices: Mapped[List["Invoice"]] = relationship(back_populates="customer")
    quotations: Mapped[List["Quotation"]] = relationship(back_populates="customer")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    invoice_number: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    invoice_date: Mapped[str] = mapped_column(String(20), nullable=False)
    po_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    po_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    engineer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    engineer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    engineer_contact: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    copy_type: Mapped[str] = mapped_column(String(20), default='original')
    gst_rate: Mapped[float] = mapped_column(Float, default=18.0)
    subtotal: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    tax_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    total_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    amount_words: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    public_token: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    private_pdf_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    public_pdf_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    private_pdf_sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    public_pdf_sha256: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='draft')
    issued_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    customer: Mapped["Customer"] = relationship(back_populates="invoices")
    items: Mapped[List["InvoiceItem"]] = relationship(back_populates="invoice")
    public_links: Mapped[List["PublicLink"]] = relationship(back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(Integer, ForeignKey("invoices.id"), nullable=False)
    serial_number: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    hsn: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    uom: Mapped[str] = mapped_column(String(20), default='Nos.')
    rate: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    invoice: Mapped["Invoice"] = relationship(back_populates="items")


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quotation_number: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    quotation_date: Mapped[date] = mapped_column(Date, nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    # Legacy fields retained for backward database compatibility; no longer used by the API/PDF engine.
    subject_dg_kva: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    subject_dg_qty: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    subtotal: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    total_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    amount_words: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    pdf_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='draft')
    issued_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    customer: Mapped["Customer"] = relationship(back_populates="quotations")
    items: Mapped[List["QuotationItem"]] = relationship(back_populates="quotation")


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    quotation_id: Mapped[int] = mapped_column(Integer, ForeignKey("quotations.id"), nullable=False)
    serial_number: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    hsn: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    uom: Mapped[str] = mapped_column(String(20), default='Nos')
    rate: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    quotation: Mapped["Quotation"] = relationship(back_populates="items")


class NumberCounter(Base):
    __tablename__ = "number_counters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    doc_type: Mapped[str] = mapped_column(String(20), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    last_number: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('doc_type', 'year', name='uq_number_counter_type_year'),
    )


class PublicLink(Base):
    __tablename__ = "public_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    invoice_id: Mapped[int] = mapped_column(Integer, ForeignKey("invoices.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    access_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_accessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    invoice: Mapped["Invoice"] = relationship(back_populates="public_links")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    details: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    performed_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        nullable=False,
    )