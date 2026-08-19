# =============================================================================
# backend/app/models/base.py
# =============================================================================
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# SQLite-compatible UUID type (stored as 36-char string)
def uuid_pk_default() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    """Shared declarative base for all SQLAlchemy ORM models."""
    pass


class TimestampMixin:
    """Adds created_at / updated_at columns to any model."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDPrimaryKeyMixin:
    """Adds a UUID primary key stored as String(36) for SQLite compatibility."""
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=uuid_pk_default,
    )
