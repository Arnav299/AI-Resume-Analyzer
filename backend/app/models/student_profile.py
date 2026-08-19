from __future__ import annotations

from sqlalchemy import String, SmallInteger, ForeignKey, UniqueConstraint, CheckConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class StudentProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """1:1 extension of users for student-specific academic and career data."""
    __tablename__ = "student_profiles"

    user_id                      : Mapped[str]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    college_name                 : Mapped[str|None]  = mapped_column(String(255), nullable=True)
    degree                       : Mapped[str|None]  = mapped_column(String(150), nullable=True)
    branch                       : Mapped[str|None]  = mapped_column(String(150), nullable=True)
    year_of_study                : Mapped[int|None]  = mapped_column(SmallInteger, nullable=True)
    graduation_year              : Mapped[int|None]  = mapped_column(SmallInteger, nullable=True)
    phone                        : Mapped[str|None]  = mapped_column(String(20),  nullable=True)
    linkedin_url                 : Mapped[str|None]  = mapped_column(String,       nullable=True)
    github_url                   : Mapped[str|None]  = mapped_column(String,       nullable=True)
    target_role_id               : Mapped[str|None]  = mapped_column(String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True)
    profile_completion_percentage: Mapped[int]       = mapped_column(SmallInteger, nullable=False, default=0)

    # Relationships
    user        : Mapped["User"]         = relationship("User",       back_populates="student_profile")
    target_role : Mapped["CareerRole"]   = relationship("CareerRole", back_populates="student_profiles", foreign_keys=[target_role_id])
    resumes     : Mapped[list["Resume"]] = relationship("Resume",     back_populates="student_profile", cascade="all, delete-orphan")
    dashboard_metrics: Mapped["StudentDashboardMetrics"] = relationship("StudentDashboardMetrics", back_populates="student", uselist=False)

    __table_args__ = (
        CheckConstraint("year_of_study BETWEEN 1 AND 6",         name="chk_sp_year_of_study"),
        CheckConstraint("graduation_year BETWEEN 2000 AND 2040",  name="chk_sp_graduation_year"),
        CheckConstraint("profile_completion_percentage BETWEEN 0 AND 100", name="chk_sp_completion_pct"),
    )

    def __repr__(self) -> str:
        return f"<StudentProfile id={self.id} user_id={self.user_id}>"
