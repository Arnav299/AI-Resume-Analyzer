from __future__ import annotations

import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin, TimestampMixin


class UserRole(str, enum.Enum):
    student = "student"
    mentor  = "mentor"
    admin   = "admin"
    recruiter = "recruiter"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Platform user — students, mentors, and admins."""
    __tablename__ = "users"

    full_name    : Mapped[str]           = mapped_column(String(255), nullable=False)
    email        : Mapped[str]           = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str]           = mapped_column(String, nullable=False)
    role         : Mapped[UserRole]      = mapped_column(SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.student, index=True)
    is_active    : Mapped[bool]          = mapped_column(Boolean, nullable=False, default=True, index=True)
    last_login   : Mapped[datetime|None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    student_profile : Mapped["StudentProfile"]       = relationship("StudentProfile", back_populates="user", uselist=False)
    activity_logs   : Mapped[list["ActivityLog"]]    = relationship("ActivityLog",    back_populates="user")
    feedbacks_given : Mapped[list["MentorFeedback"]] = relationship("MentorFeedback", back_populates="mentor", foreign_keys="MentorFeedback.mentor_id")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
