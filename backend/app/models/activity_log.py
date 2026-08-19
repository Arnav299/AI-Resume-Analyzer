from __future__ import annotations

from datetime import datetime

from sqlalchemy import String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class ActivityLog(UUIDPrimaryKeyMixin, Base):
    """Audit log for all significant platform actions."""
    __tablename__ = "activity_logs"

    user_id            : Mapped[str|None]  = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action_type        : Mapped[str]       = mapped_column(String(100), nullable=False, index=True)
    action_description : Mapped[str|None]  = mapped_column(Text,         nullable=True)
    entity_name        : Mapped[str|None]  = mapped_column(String(100),  nullable=True)
    entity_id          : Mapped[str|None]  = mapped_column(String(36),   nullable=True)
    ip_address         : Mapped[str|None]  = mapped_column(String(45),   nullable=True)  # max IPv6 length
    created_at         : Mapped[datetime]  = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user : Mapped["User"] = relationship("User", back_populates="activity_logs")

    def __repr__(self) -> str:
        return f"<ActivityLog id={self.id} action={self.action_type} user={self.user_id}>"
