from __future__ import annotations

from sqlalchemy import String, ForeignKey, SmallInteger, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class RoleSkill(UUIDPrimaryKeyMixin, Base):
    """Required skills per career role with importance weighting (1–10)."""
    __tablename__ = "role_skills"

    role_id           : Mapped[str] = mapped_column(String(36), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id          : Mapped[str] = mapped_column(String(36), ForeignKey("skills.id",       ondelete="CASCADE"), nullable=False, index=True)
    importance_weight : Mapped[int] = mapped_column(SmallInteger, nullable=False, default=5)

    # Relationships
    career_role : Mapped["CareerRole"] = relationship("CareerRole", back_populates="role_skills")
    skill       : Mapped["Skill"]      = relationship("Skill",      back_populates="role_skills")

    __table_args__ = (
        UniqueConstraint("role_id", "skill_id", name="uq_role_skills"),
        CheckConstraint("importance_weight BETWEEN 1 AND 10", name="chk_role_skills_weight"),
    )

    def __repr__(self) -> str:
        return f"<RoleSkill role={self.role_id} skill={self.skill_id} weight={self.importance_weight}>"
