from __future__ import annotations

from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from db.models import NumberCounter


STARTING_SEQUENCES = {
    # New calendar years start their document sequence at 1.
    # Existing rows in number_counters are preserved.
    "invoice": 0,
    "quotation": 0,
}


def current_year() -> int:
    """Calendar year used by MMW document numbering."""
    return datetime.now().year


def initialize_counters(db: Session, year: int | None = None) -> None:
    """Ensure the requested calendar-year counters exist."""
    year = year or current_year()

    for doc_type, starting in STARTING_SEQUENCES.items():
        row = db.execute(
            select(NumberCounter).where(
                NumberCounter.doc_type == doc_type,
                NumberCounter.year == year,
            )
        ).scalar_one_or_none()

        if row is None:
            db.add(
                NumberCounter(
                    doc_type=doc_type,
                    year=year,
                    last_number=starting,
                )
            )

    db.commit()


def _allocate_sqlite(
    db: Session,
    doc_type: str,
    year: int,
) -> int:
    """Atomically increment a SQLite counter inside the caller's transaction.

    SQLite does not provide PostgreSQL-style SELECT FOR UPDATE. An atomic
    UPDATE makes the increment itself the serialization point, preventing
    two concurrent requests from reading the same counter value.
    """
    result = db.execute(
        update(NumberCounter)
        .where(
            NumberCounter.doc_type == doc_type,
            NumberCounter.year == year,
        )
        .values(last_number=NumberCounter.last_number + 1)
    )

    if result.rowcount != 1:
        # This normally means the startup/year initialization did not create
        # the counter. Create it, then perform the same atomic increment.
        db.add(
            NumberCounter(
                doc_type=doc_type,
                year=year,
                last_number=STARTING_SEQUENCES[doc_type],
            )
        )
        db.flush()

        db.execute(
            update(NumberCounter)
            .where(
                NumberCounter.doc_type == doc_type,
                NumberCounter.year == year,
            )
            .values(last_number=NumberCounter.last_number + 1)
        )

    row = db.execute(
        select(NumberCounter.last_number).where(
            NumberCounter.doc_type == doc_type,
            NumberCounter.year == year,
        )
    ).scalar_one()

    return int(row)


def allocate_number(
    db: Session,
    doc_type: str,
    year: int | None = None,
) -> str:
    """Allocate the next document number inside the caller's transaction.

    SQLite uses an atomic UPDATE instead of SELECT FOR UPDATE because SQLite
    does not support row-level SELECT locking. Other databases retain
    SELECT ... FOR UPDATE behavior.

    The caller must commit the transaction after the document/PDF succeeds.
    If the caller rolls back, the counter increment rolls back too.
    """
    if doc_type not in STARTING_SEQUENCES:
        raise ValueError(f"Unknown counter type: {doc_type}")

    year = year or current_year()

    dialect_name = db.get_bind().dialect.name

    if dialect_name == "sqlite":
        sequence = _allocate_sqlite(db, doc_type, year)
    else:
        row = db.execute(
            select(NumberCounter)
            .where(
                NumberCounter.doc_type == doc_type,
                NumberCounter.year == year,
            )
            .with_for_update()
        ).scalar_one_or_none()

        if row is None:
            row = NumberCounter(
                doc_type=doc_type,
                year=year,
                last_number=STARTING_SEQUENCES[doc_type],
            )
            db.add(row)
            db.flush()

        row.last_number += 1
        db.flush()
        sequence = int(row.last_number)

    if doc_type == "invoice":
        return f"MAX/{year}/{sequence:04d}"

    return f"MAX/{year}/S{sequence:04d}"


def peek_next_number(
    db: Session,
    doc_type: str,
    year: int | None = None,
) -> str:
    """Preview what the next document number will be, without incrementing the counter."""
    if doc_type not in STARTING_SEQUENCES:
        raise ValueError(f"Unknown counter type: {doc_type}")

    year = year or current_year()
    row = db.execute(
        select(NumberCounter).where(
            NumberCounter.doc_type == doc_type,
            NumberCounter.year == year,
        )
    ).scalar_one_or_none()

    last = row.last_number if row is not None else STARTING_SEQUENCES[doc_type]
    sequence = last + 1

    if doc_type == "invoice":
        return f"MAX/{year}/{sequence:04d}"

    return f"MAX/{year}/S{sequence:04d}"
