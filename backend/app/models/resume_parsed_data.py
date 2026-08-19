from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, Text, ForeignKey, UniqueConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class ResumeParsedData(UUIDPrimaryKeyMixin, Base):
    """Structured content extracted from a PDF resume by the parser service."""
    __tablename__ = "resume_parsed_data"

    resume_id               : Mapped[str]       = mapped_column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    extracted_name          : Mapped[str|None]  = mapped_column(String(255), nullable=True)
    extracted_email         : Mapped[str|None]  = mapped_column(String(320), nullable=True)
    extracted_phone         : Mapped[str|None]  = mapped_column(String(30),  nullable=True)
    education_summary       : Mapped[str|None]  = mapped_column(Text, nullable=True)
    experience_summary      : Mapped[str|None]  = mapped_column(Text, nullable=True)
    projects_summary        : Mapped[str|None]  = mapped_column(Text, nullable=True)
    certifications_summary  : Mapped[str|None]  = mapped_column(Text, nullable=True)
    extracted_text          : Mapped[str|None]  = mapped_column(Text, nullable=True)  # full raw text for AI
    parsed_at               : Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    resume : Mapped["Resume"] = relationship("Resume", back_populates="parsed_data")

    def __repr__(self) -> str:
        return f"<ResumeParsedData resume_id={self.resume_id} name={self.extracted_name}>"
