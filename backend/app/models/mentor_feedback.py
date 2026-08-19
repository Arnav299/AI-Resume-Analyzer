from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, SmallInteger, Text, UniqueConstraint, CheckConstraint, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class MentorFeedback(UUIDPrimaryKeyMixin, Base):
    """Human mentor ratings and comments on analysis results."""
    __tablename__ = "mentor_feedback"

    analysis_result_id : Mapped[str]       = mapped_column(String(36), ForeignKey("analysis_results.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id          : Mapped[str]       = mapped_column(String(36), ForeignKey("users.id",            ondelete="CASCADE"), nullable=False, index=True)
    rating             : Mapped[int]       = mapped_column(SmallInteger, nullable=False)
    comments           : Mapped[str|None]  = mapped_column(Text, nullable=True)
    improvement_actions: Mapped[list|None] = mapped_column(JSON, nullable=True)
    created_at         : Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    analysis_result : Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="mentor_feedbacks")
    mentor          : Mapped["User"]           = relationship("User",           back_populates="feedbacks_given", foreign_keys=[mentor_id])

    __table_args__ = (
        UniqueConstraint("analysis_result_id", "mentor_id", name="uq_mentor_feedback"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="chk_mf_rating"),
    )

    def __repr__(self) -> str:
        return f"<MentorFeedback analysis={self.analysis_result_id} mentor={self.mentor_id} rating={self.rating}>"
