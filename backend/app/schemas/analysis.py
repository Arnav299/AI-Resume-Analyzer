from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, List, Optional


class AnalysisRequest(BaseModel):
    """Request body for triggering an analysis run."""
    resume_id: Optional[str] = None
    target_role_id: Optional[str] = None
    target_jd_id: Optional[str] = None
    gemini_api_key: Optional[str] = None


class AnalysisResponse(BaseModel):
    """Full analysis result returned to the client."""
    id: str
    resume_id: str
    target_role_id: Optional[str] = None
    target_jd_id: Optional[str] = None
    readiness_score: float
    skill_score: float
    project_score: float
    professional_presence_score: float
    overall_match_score: Optional[float] = 0
    education_score: Optional[float] = 0
    experience_score: Optional[float] = 0
    location_score: Optional[float] = 0
    status: Optional[str] = "Pending"
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendation_summary: Optional[str] = None
    analyzed_at: datetime

    class Config:
        from_attributes = True


class AnalysisDetailResponse(AnalysisResponse):
    """Extended response that also includes the full skill breakdown."""
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    extracted_skills: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None
    learning_plan: Optional[List[Dict[str, Any]]] = None
    quick_wins: Optional[List[str]] = None
    education: Optional[str] = None
    experience: Optional[str] = None


class BulkAnalysisResponse(BaseModel):
    """Response schema for a single candidate in the bulk analysis leaderboard."""
    name: str
    overall: float
    skillMatch: float
    experience: float
    ats: float
    status: str
    missing: List[str]
    matched: List[str]
    ai_rank: Optional[int] = None
    percentile: Optional[float] = None
    selection_status: Optional[str] = "⏳ Waiting"
    # Candidate profile fields extracted from resume
    location: Optional[str] = None
    education: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    certifications: Optional[List[str]] = None
    
    # New ATS Score Breakdown fields
    required_skills_score: Optional[float] = None
    preferred_skills_score: Optional[float] = None
    experience_score_pct: Optional[float] = None
    responsibility_score: Optional[float] = None
    education_score_pct: Optional[float] = None
    certification_score: Optional[float] = None
    location_score: Optional[float] = None
    semantic_score: Optional[float] = None
    final_ats_score: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    extra_skills: Optional[List[str]] = None
    semantic_matches: Optional[Dict[str, str]] = None
    debug_info: Optional[Dict[str, Any]] = None
