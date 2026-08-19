from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class SkillCategory(str, enum.Enum):
    Programming    = "Programming"
    Database       = "Database"
    Cloud          = "Cloud"
    AI_ML          = "AI/ML"
    Data_Analytics = "Data Analytics"
    Frontend       = "Frontend"
    Backend        = "Backend"
    DevOps         = "DevOps"
    Soft_Skills    = "Soft Skills"
    Other          = "Other"


class Skill(UUIDPrimaryKeyMixin, Base):
    """Master skill library — referenced across resume extraction and role mapping."""
    __tablename__ = "skills"

    skill_name : Mapped[str]           = mapped_column(String(150), unique=True, nullable=False, index=True)
    category   : Mapped[SkillCategory] = mapped_column(SAEnum(SkillCategory, name="skill_category"), nullable=False, default=SkillCategory.Other, index=True)
    is_active  : Mapped[bool]          = mapped_column(Boolean, nullable=False, default=True)
    created_at : Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    role_skills          : Mapped[list["RoleSkill"]]          = relationship("RoleSkill",          back_populates="skill", cascade="all, delete-orphan")
    resume_skills        : Mapped[list["ResumeSkill"]]        = relationship("ResumeSkill",        back_populates="skill", cascade="all, delete-orphan")
    skill_gap_analyses   : Mapped[list["SkillGapAnalysis"]]   = relationship("SkillGapAnalysis",   back_populates="skill")
    learning_path_skills : Mapped[list["LearningPathSkill"]]  = relationship("LearningPathSkill",  back_populates="skill")

    def __repr__(self) -> str:
        return f"<Skill id={self.id} name={self.skill_name} category={self.category}>"
