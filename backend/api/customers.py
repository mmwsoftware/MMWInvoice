"""Customer API endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Customer
from api.auth import get_current_user


router = APIRouter()


class CustomerCreate(BaseModel):
    name: str
    address_lines: list[str]
    page9_address_lines: list[str] | None = None
    state_code: str | None = None
    gstin: str | None = None
    contact_person: str | None = None
    email: str | None = None
    phone: str | None = None


class CustomerResponse(BaseModel):
    id: int
    name: str
    address_lines: list[str]
    page9_address_lines: list[str] | None
    state_code: str | None
    gstin: str | None
    contact_person: str | None
    email: str | None
    phone: str | None
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True}

@router.post("", response_model=CustomerResponse)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Create a new customer."""
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    search: str | None = Query(None, description="Search by name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """List customers, optionally searching by name."""
    q = db.query(Customer)
    if search:
        q = q.filter(Customer.name.ilike(f"%{search}%"))
    return q.order_by(Customer.name).offset(skip).limit(limit).all()


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Get a customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    data: CustomerCreate,
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    """Update a customer."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    for key, value in data.model_dump().items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)
    return customer
