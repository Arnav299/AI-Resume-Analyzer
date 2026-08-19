from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import String, Text, Boolean, Enum as SAEnum, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class DifficultyLevel(str, enum.Enum):
    beginner     = "beginner"
    intermediate = "intermediate"
    advanced     = "advanced"


class LearningPath(UUIDPrimaryKeyMixin, Base):
    """Curated learning tracks mapped to specific skill gaps."""
    __tablename__ = "learning_paths"

    title              : Mapped[str]             = mapped_column(String(255),  unique=True, nullable=False)
    description        : Mapped[str|None]        = mapped_column(Text,          nullable=True)
    estimated_duration : Mapped[str|None]        = mapped_column(String(100),   nullable=True)   # e.g. "6 weeks"
    difficulty_level   : Mapped[DifficultyLevel] = mapped_column(SAEnum(DifficultyLevel, name="difficulty_level"), nullable=False, default=DifficultyLevel.beginner, index=True)
    is_active          : Mapped[bool]            = mapped_column(Boolean,       nullable=False, default=True)
    created_at         : Mapped[datetime]        = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    learning_path_skills : Mapped[list["LearningPathSkill"]]  = relationship("LearningPathSkill",  back_populates="learning_path", cascade="all, delete-orphan")
    user_recommendations : Mapped[list["UserRecommendation"]] = relationship("UserRecommendation", back_populates="learning_path")

    def __repr__(self) -> str:
        return f"<LearningPath id={self.id} title={self.title}>"
