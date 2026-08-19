# =============================================================================
# backend/app/models/__init__.py
# =============================================================================
from .base import Base
from .user import User
from .career_role import CareerRole
from .skill import Skill
from .role_skill import RoleSkill
from .student_profile import StudentProfile
from .resume import Resume
from .resume_parsed_data import ResumeParsedData
from .resume_skill import ResumeSkill
from .analysis_result import AnalysisResult
from .skill_gap_analysis import SkillGapAnalysis
from .career_recommendation import CareerRecommendation
from .learning_path import LearningPath
from .learning_path_skill import LearningPathSkill
from .user_recommendation import UserRecommendation
from .mentor_feedback import MentorFeedback
from .student_dashboard_metrics import StudentDashboardMetrics
from .activity_log import ActivityLog
from .ai_recommendation_log import AIRecommendationLog
from .interview_scorecard import InterviewScorecard
from .pipeline_entry import PipelineEntry
from .jd import JobDescription

__all__ = [
    "Base",
    "User",
    "CareerRole",
    "Skill",
    "RoleSkill",
    "StudentProfile",
    "Resume",
    "ResumeParsedData",
    "ResumeSkill",
    "AnalysisResult",
    "SkillGapAnalysis",
    "CareerRecommendation",
    "LearningPath",
    "LearningPathSkill",
    "UserRecommendation",
    "MentorFeedback",
    "StudentDashboardMetrics",
    "ActivityLog",
    "AIRecommendationLog",
    "InterviewScorecard",
    "PipelineEntry",
    "JobDescription",
]
