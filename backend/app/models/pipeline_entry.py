from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


# Valid pipeline stages (matches frontend STAGES config)
PIPELINE_STAGES = ["new", "screening", "interview", "offer", "hired", "rejected", "successful", "not_successful"]


class PipelineEntry(UUIDPrimaryKeyMixin, Base):
    """Tracks which Kanban pipeline stage a candidate (resume) is currently in.

    One row per resume.  Created on first access / drag-drop.
    No migration needed — table is created by SQLAlchemy create_all on startup.
    """
    __tablename__ = "pipeline_entries"

    resume_id   : Mapped[str]       = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    stage       : Mapped[str]       = mapped_column(String(30), nullable=False, default="new")
    updated_at  : Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    resume : Mapped["Resume"] = relationship("Resume")

    def __repr__(self) -> str:
        return f"<PipelineEntry resume={self.resume_id} stage={self.stage}>"
