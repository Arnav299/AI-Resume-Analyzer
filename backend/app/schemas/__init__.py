# backend/app/schemas/__init__.py
from .token import Token, TokenPayload
from .user import UserCreate, UserResponse, UserLogin
from .resume import ResumeUploadResponse, ResumeResponse
from .analysis import AnalysisRequest, AnalysisResponse
from .dashboard import StudentDashboardResponse, MentorDashboardResponse
from .feedback import FeedbackCreate, FeedbackResponse
