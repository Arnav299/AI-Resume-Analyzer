from __future__ import annotations

from sqlalchemy import String, ForeignKey, SmallInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class LearningPathSkill(UUIDPrimaryKeyMixin, Base):
    """Skills taught within each learning path, ordered by sequence."""
    __tablename__ = "learning_path_skills"

    learning_path_id : Mapped[str] = mapped_column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id         : Mapped[str] = mapped_column(String(36), ForeignKey("skills.id",          ondelete="CASCADE"), nullable=False, index=True)
    sequence_order   : Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)

    # Relationships
    learning_path : Mapped["LearningPath"] = relationship("LearningPath", back_populates="learning_path_skills")
    skill         : Mapped["Skill"]        = relationship("Skill",        back_populates="learning_path_skills")

    __table_args__ = (
        UniqueConstraint("learning_path_id", "skill_id", name="uq_learning_path_skills"),
    )

    def __repr__(self) -> str:
        return f"<LearningPathSkill path={self.learning_path_id} skill={self.skill_id} order={self.sequence_order}>"
