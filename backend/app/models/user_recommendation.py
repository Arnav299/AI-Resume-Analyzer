from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import String, Text, Boolean, Enum as SAEnum, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class PriorityLevel(str, enum.Enum):
    high   = "high"
    medium = "medium"
    low    = "low"


class UserRecommendation(UUIDPrimaryKeyMixin, Base):
    """Actionable recommendations generated per analysis, linked to learning paths."""
    __tablename__ = "user_recommendations"

    analysis_result_id : Mapped[str]           = mapped_column(String(36), ForeignKey("analysis_results.id", ondelete="CASCADE"), nullable=False, index=True)
    learning_path_id   : Mapped[str|None]      = mapped_column(String(36), ForeignKey("learning_paths.id",   ondelete="SET NULL"), nullable=True, index=True)
    recommendation_text: Mapped[str]           = mapped_column(Text, nullable=False)
    priority_level     : Mapped[PriorityLevel] = mapped_column(SAEnum(PriorityLevel, name="priority_level"), nullable=False, default=PriorityLevel.medium, index=True)
    is_completed       : Mapped[bool]          = mapped_column(Boolean, nullable=False, default=False)
    created_at         : Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    analysis_result : Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="user_recommendations")
    learning_path   : Mapped["LearningPath"]   = relationship("LearningPath",  back_populates="user_recommendations")

    def __repr__(self) -> str:
        return f"<UserRecommendation id={self.id} priority={self.priority_level}>"
