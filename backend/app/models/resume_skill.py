from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import String, ForeignKey, Numeric, UniqueConstraint, CheckConstraint, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class ExtractionSource(str, enum.Enum):
    rule_based    = "rule_based"
    ai_extraction = "ai_extraction"
    manual        = "manual"


class ResumeSkill(UUIDPrimaryKeyMixin, Base):
    """Skills identified within a specific resume."""
    __tablename__ = "resume_skills"

    resume_id         : Mapped[str]              = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id          : Mapped[str]              = mapped_column(String(36), ForeignKey("skills.id",  ondelete="CASCADE"), nullable=False, index=True)
    confidence_score  : Mapped[float]            = mapped_column(Numeric(5, 2),      nullable=False, default=1.00)
    extraction_source : Mapped[ExtractionSource] = mapped_column(SAEnum(ExtractionSource, name="extraction_source"), nullable=False, default=ExtractionSource.rule_based)
    created_at        : Mapped[datetime]         = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    resume : Mapped["Resume"] = relationship("Resume", back_populates="resume_skills")
    skill  : Mapped["Skill"]  = relationship("Skill",  back_populates="resume_skills")

    __table_args__ = (
        UniqueConstraint("resume_id", "skill_id", name="uq_resume_skills"),
        CheckConstraint("confidence_score BETWEEN 0 AND 1", name="chk_resume_skill_confidence"),
    )

    def __repr__(self) -> str:
        return f"<ResumeSkill resume={self.resume_id} skill={self.skill_id} conf={self.confidence_score}>"
