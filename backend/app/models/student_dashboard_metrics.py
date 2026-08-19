from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, Integer, Numeric, UniqueConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class StudentDashboardMetrics(UUIDPrimaryKeyMixin, Base):
    """Pre-aggregated dashboard summary per student."""
    __tablename__ = "student_dashboard_metrics"

    student_id             : Mapped[str]        = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_resumes_uploaded : Mapped[int]        = mapped_column(Integer,      nullable=False, default=0)
    latest_score           : Mapped[float|None] = mapped_column(Numeric(5, 2), nullable=True)
    average_score          : Mapped[float|None] = mapped_column(Numeric(5, 2), nullable=True)
    strongest_skill        : Mapped[str|None]   = mapped_column(String(150),   nullable=True)
    weakest_skill          : Mapped[str|None]   = mapped_column(String(150),   nullable=True)
    last_updated           : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    student : Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="dashboard_metrics")

    def __repr__(self) -> str:
        return f"<StudentDashboardMetrics student={self.student_id} latest={self.latest_score}>"
