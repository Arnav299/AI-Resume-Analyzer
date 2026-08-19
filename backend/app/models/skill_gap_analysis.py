from __future__ import annotations

import enum

from sqlalchemy import String, ForeignKey, UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class GapType(str, enum.Enum):
    matched     = "matched"
    missing     = "missing"
    recommended = "recommended"


class SkillGapAnalysis(UUIDPrimaryKeyMixin, Base):
    """Per-skill gap classification for a given analysis result."""
    __tablename__ = "skill_gap_analysis"

    analysis_result_id : Mapped[str]     = mapped_column(String(36), ForeignKey("analysis_results.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id           : Mapped[str]     = mapped_column(String(36), ForeignKey("skills.id",           ondelete="CASCADE"), nullable=False, index=True)
    gap_type           : Mapped[GapType] = mapped_column(SAEnum(GapType, name="gap_type"), nullable=False, index=True)

    # Relationships
    analysis_result : Mapped["AnalysisResult"] = relationship("AnalysisResult", back_populates="skill_gap_analyses")
    skill           : Mapped["Skill"]          = relationship("Skill",          back_populates="skill_gap_analyses")

    __table_args__ = (
        UniqueConstraint("analysis_result_id", "skill_id", name="uq_skill_gap_analysis"),
    )

    def __repr__(self) -> str:
        return f"<SkillGapAnalysis analysis={self.analysis_result_id} skill={self.skill_id} type={self.gap_type}>"
