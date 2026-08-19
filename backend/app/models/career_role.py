from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class CareerRole(UUIDPrimaryKeyMixin, Base):
    """Target career roles students can analyse themselves against."""
    __tablename__ = "career_roles"

    role_name         : Mapped[str]       = mapped_column(String(150), unique=True, nullable=False, index=True)
    description       : Mapped[str|None]  = mapped_column(String,      nullable=True)
    industry_category : Mapped[str|None]  = mapped_column(String(100), nullable=True)
    is_active         : Mapped[bool]      = mapped_column(Boolean,     nullable=False, default=True)
    created_at        : Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    role_skills             : Mapped[list["RoleSkill"]]            = relationship("RoleSkill",            back_populates="career_role", cascade="all, delete-orphan")
    student_profiles        : Mapped[list["StudentProfile"]]       = relationship("StudentProfile",       back_populates="target_role", foreign_keys="StudentProfile.target_role_id")
    analysis_results        : Mapped[list["AnalysisResult"]]       = relationship("AnalysisResult",       back_populates="target_role")
    career_recommendations  : Mapped[list["CareerRecommendation"]] = relationship("CareerRecommendation", back_populates="recommended_role", foreign_keys="CareerRecommendation.recommended_role_id")

    def __repr__(self) -> str:
        return f"<CareerRole id={self.id} name={self.role_name}>"
