from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .resume import Resume
    from .skill_gap_analysis import SkillGapAnalysis
    from .career_recommendation import CareerRecommendation
    from .user_recommendation import UserRecommendation
    from .mentor_feedback import MentorFeedback
    from .ai_recommendation_log import AIRecommendationLog
    from .jd import JobDescription
from sqlalchemy import String, ForeignKey, Numeric, Text, CheckConstraint, DateTime, func, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, UUIDPrimaryKeyMixin


class AnalysisResult(UUIDPrimaryKeyMixin, Base):
    """Final scored analysis of a resume against a target career role.

    Readiness Score = Skill Score (max 70) + Project Score (max 20) + Professional Presence (max 10) = max 100
    """
    __tablename__ = "analysis_results"

    resume_id                   : Mapped[str]        = mapped_column(String(36), ForeignKey("resumes.id",      ondelete="CASCADE"), nullable=False, index=True)
    target_role_id              : Mapped[str|None]   = mapped_column(String(36), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=True, index=True)
    target_jd_id                : Mapped[str|None]   = mapped_column(String(36), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=True, index=True)
    readiness_score             : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    skill_score                 : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    
    # New ATS Scores
    required_skills_score       : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    preferred_skills_score      : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    experience_score            : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    responsibility_match_score  : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    education_score             : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    certification_score         : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    location_score              : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    semantic_score              : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    ats_formatting_score        : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    final_ats_score             : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    
    overall_match_score         : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    
    project_score               : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    professional_presence_score : Mapped[float]      = mapped_column(Numeric(5, 2), nullable=False, default=0)
    strengths                   : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    weaknesses                  : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    recommendation_summary      : Mapped[str|None]   = mapped_column(Text, nullable=True)
    matched_skills              : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    missing_skills              : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    extracted_skills            : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    soft_skills                 : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    learning_plan               : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    quick_wins                  : Mapped[list|None]  = mapped_column(JSON, nullable=True)
    
    # ATS Status & Ranking
    status                      : Mapped[str]        = mapped_column(String(50), nullable=False, default="Pending")
    selection_status            : Mapped[str|None]   = mapped_column(String(50), nullable=True, default="⏳ Waiting")
    ai_rank                     : Mapped[int|None]   = mapped_column(Integer, nullable=True)
    percentile                  : Mapped[float|None] = mapped_column(Numeric(5, 2), nullable=True)
    
    analyzed_at                 : Mapped[datetime]   = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    resume                  : Mapped["Resume"]                     = relationship("Resume",               back_populates="analysis_results")
    target_role             : Mapped["CareerRole"]                 = relationship("CareerRole",            back_populates="analysis_results")
    target_jd               : Mapped["JobDescription"]             = relationship("JobDescription")
    skill_gap_analyses      : Mapped[list["SkillGapAnalysis"]]     = relationship("SkillGapAnalysis",      back_populates="analysis_result", cascade="all, delete-orphan")
    career_recommendations  : Mapped[list["CareerRecommendation"]] = relationship("CareerRecommendation",  back_populates="analysis_result", cascade="all, delete-orphan")
    user_recommendations    : Mapped[list["UserRecommendation"]]   = relationship("UserRecommendation",   back_populates="analysis_result", cascade="all, delete-orphan")
    mentor_feedbacks        : Mapped[list["MentorFeedback"]]       = relationship("MentorFeedback",        back_populates="analysis_result", cascade="all, delete-orphan")
    ai_recommendation_logs  : Mapped[list["AIRecommendationLog"]]  = relationship("AIRecommendationLog",  back_populates="analysis_result", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("readiness_score BETWEEN 0 AND 100",             name="chk_ar_readiness_score"),
        CheckConstraint("skill_score BETWEEN 0 AND 100",                 name="chk_ar_skill_score"),
        CheckConstraint("project_score BETWEEN 0 AND 100",               name="chk_ar_project_score"),
        CheckConstraint("professional_presence_score BETWEEN 0 AND 100", name="chk_ar_presence_score"),
    )

    def __repr__(self) -> str:
        return f"<AnalysisResult id={self.id} score={self.readiness_score}>"
