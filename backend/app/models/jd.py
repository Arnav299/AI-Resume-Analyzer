# =============================================================================
# backend/app/models/jd.py — Job Description ORM model
# =============================================================================
from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import String, Text, JSON, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class JobDescription(UUIDPrimaryKeyMixin, Base):
    """Stores Job Descriptions created via JD Studio for candidate evaluations."""
    __tablename__ = "job_descriptions"

    user_id          : Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title            : Mapped[str]        = mapped_column(String(200), nullable=False, index=True)
    company          : Mapped[str | None] = mapped_column(String(150), nullable=True)
    domain           : Mapped[str | None] = mapped_column(String(100), nullable=True)
    department       : Mapped[str | None] = mapped_column(String(100), nullable=True)
    location         : Mapped[str | None] = mapped_column(String(150), nullable=True)
    employment_type  : Mapped[str | None] = mapped_column(String(50),  nullable=True, default="Full-time")
    work_mode        : Mapped[str | None] = mapped_column(String(50),  nullable=True, default="On-site")
    salary           : Mapped[str | None] = mapped_column(String(100), nullable=True)
    experience_level : Mapped[str | None] = mapped_column(String(50),  nullable=True, default="Mid-Level")
    education        : Mapped[str | None] = mapped_column(String(150), nullable=True)
    description      : Mapped[str | None] = mapped_column(Text,        nullable=True)
    requirements     : Mapped[str | None] = mapped_column(Text,        nullable=True)
    benefits         : Mapped[str | None] = mapped_column(Text,        nullable=True)
    
    # Store skills as a JSON list of strings, e.g., ["React", "TypeScript", "Node.js"]
    skills           : Mapped[list[str] | None] = mapped_column(JSON, nullable=True, default=list)
    preferred_skills : Mapped[list[str] | None] = mapped_column(JSON, nullable=True, default=list)
    certifications   : Mapped[list[str] | None] = mapped_column(JSON, nullable=True, default=list)
    
    weights          : Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True, default=dict)
    
    ai_matching_threshold : Mapped[int] = mapped_column(nullable=False, default=70)
    selected_threshold    : Mapped[int] = mapped_column(nullable=False, default=90)
    waiting_threshold     : Mapped[int] = mapped_column(nullable=False, default=75)
    status                : Mapped[str] = mapped_column(String(50), nullable=False, default="Active")

    created_at       : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<JobDescription id={self.id} title='{self.title}' company='{self.company}'>"
