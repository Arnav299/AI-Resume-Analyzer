from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, Text, Numeric, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class InterviewScorecard(UUIDPrimaryKeyMixin, Base):
    """Per-candidate interview scorecard filled in by a recruiter/interviewer.

    Stored as JSON columns so no enum migration is needed.
    Scores: ratings per category (1-5), overall_score (0-100).
    """
    __tablename__ = "interview_scorecards"

    # Candidate is identified by their resume_id (the entity tracked in pipeline)
    resume_id       : Mapped[str]        = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    # Who filled in the scorecard (optional — not enforced for org users)
    interviewer_id  : Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id",   ondelete="SET NULL"), nullable=True)

    # Per-category star ratings stored as JSON dict { "communication": 4, ... }
    ratings         : Mapped[dict | None]  = mapped_column(JSON, nullable=True)
    # Per-category notes stored as JSON dict { "communication": "Great articulation" }
    notes           : Mapped[dict | None]  = mapped_column(JSON, nullable=True)
    # Hire | Hold | Reject
    recommendation  : Mapped[str | None]   = mapped_column(String(20), nullable=True)
    # Free-text summary
    overall_notes   : Mapped[str | None]   = mapped_column(Text, nullable=True)
    # Computed weighted score (0-100)
    overall_score   : Mapped[float]        = mapped_column(Numeric(5, 2), nullable=False, default=0)

    saved_at        : Mapped[datetime]     = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    resume : Mapped["Resume"] = relationship("Resume")

    def __repr__(self) -> str:
        return f"<InterviewScorecard resume={self.resume_id} score={self.overall_score} rec={self.recommendation}>"
