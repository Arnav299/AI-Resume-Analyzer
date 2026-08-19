from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, Numeric, SmallInteger, UniqueConstraint, CheckConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class CareerRecommendation(UUIDPrimaryKeyMixin, Base):
    """Top-N alternative career role matches ranked by score."""
    __tablename__ = "career_recommendations"

    analysis_result_id  : Mapped[str]   = mapped_column(String(36), ForeignKey("analysis_results.id", ondelete="CASCADE"), nullable=False, index=True)
    recommended_role_id : Mapped[str]   = mapped_column(String(36), ForeignKey("career_roles.id",     ondelete="CASCADE"), nullable=False, index=True)
    match_percentage    : Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    rank_position       : Mapped[int]   = mapped_column(SmallInteger,   nullable=False, default=1)
    created_at          : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    analysis_result  : Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="career_recommendations")
    recommended_role : Mapped["CareerRole"]     = relationship("CareerRole",     back_populates="career_recommendations", foreign_keys=[recommended_role_id])

    __table_args__ = (
        UniqueConstraint("analysis_result_id", "recommended_role_id", name="uq_career_recommendations"),
        CheckConstraint("match_percentage BETWEEN 0 AND 100",  name="chk_cr_match_pct"),
        CheckConstraint("rank_position BETWEEN 1 AND 10",      name="chk_cr_rank"),
    )

    def __repr__(self) -> str:
        return f"<CareerRecommendation analysis={self.analysis_result_id} role={self.recommended_role_id} rank={self.rank_position}>"
