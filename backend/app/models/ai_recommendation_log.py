from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, Text, Integer, CheckConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class AIRecommendationLog(UUIDPrimaryKeyMixin, Base):
    """Audit trail for AI-generated recommendations — enables prompt tuning and cost monitoring."""
    __tablename__ = "ai_recommendation_logs"

    analysis_result_id : Mapped[str]      = mapped_column(String(36), ForeignKey("analysis_results.id", ondelete="CASCADE"), nullable=False, index=True)
    prompt_used        : Mapped[str]      = mapped_column(Text,         nullable=False)
    ai_response        : Mapped[str]      = mapped_column(Text,         nullable=False)
    model_name         : Mapped[str]      = mapped_column(String(100),  nullable=False, index=True)
    token_usage        : Mapped[int|None] = mapped_column(Integer,      nullable=True)
    generated_at       : Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    analysis_result : Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="ai_recommendation_logs")

    __table_args__ = (
        CheckConstraint("token_usage >= 0", name="chk_arl_token_usage"),
    )

    def __repr__(self) -> str:
        return f"<AIRecommendationLog id={self.id} model={self.model_name} tokens={self.token_usage}>"
