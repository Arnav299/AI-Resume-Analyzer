from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import String, Integer, Boolean, ForeignKey, CheckConstraint, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class UploadStatus(str, enum.Enum):
    uploaded   = "uploaded"
    processing = "processing"
    analyzed   = "analyzed"
    failed     = "failed"


class Resume(UUIDPrimaryKeyMixin, Base):
    """Resume upload metadata — actual file stored on disk / object storage."""
    __tablename__ = "resumes"

    student_profile_id : Mapped[str|None]      = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=True, index=True)
    uploader_id        : Mapped[str|None]      = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    original_filename  : Mapped[str]           = mapped_column(String(500),  nullable=False)
    file_path          : Mapped[str]           = mapped_column(String,        nullable=False)
    file_size          : Mapped[int|None]      = mapped_column(Integer,       nullable=True)
    file_type          : Mapped[str]           = mapped_column(String(50),    nullable=False, default="application/pdf")
    upload_status      : Mapped[UploadStatus]  = mapped_column(SAEnum(UploadStatus, name="upload_status"), nullable=False, default=UploadStatus.uploaded, index=True)
    is_active          : Mapped[bool]          = mapped_column(Boolean,       nullable=False, default=True, index=True)
    uploaded_at        : Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    student_profile  : Mapped["StudentProfile"]        = relationship("StudentProfile",   back_populates="resumes")
    uploader         : Mapped["User"]                  = relationship("User")
    parsed_data      : Mapped["ResumeParsedData"]       = relationship("ResumeParsedData", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    resume_skills    : Mapped[list["ResumeSkill"]]      = relationship("ResumeSkill",      back_populates="resume", cascade="all, delete-orphan")
    analysis_results : Mapped[list["AnalysisResult"]]   = relationship("AnalysisResult",   back_populates="resume", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Resume id={self.id} filename={self.original_filename} status={self.upload_status}>"
