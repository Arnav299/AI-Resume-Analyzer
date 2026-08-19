# backend/app/routers/__init__.py
from fastapi import APIRouter
from .auth import router as auth_router
from .resumes import router as resumes_router
from .analysis import router as analysis_router
from .dashboard import router as dashboard_router
from .feedback import router as feedback_router
from .career_roles import router as career_roles_router

api_router = APIRouter()
api_router.include_router(auth_router,        prefix="/auth",         tags=["auth"])
api_router.include_router(resumes_router,     prefix="/resumes",      tags=["resumes"])
api_router.include_router(analysis_router,    prefix="/analysis",     tags=["analysis"])
api_router.include_router(dashboard_router,   prefix="/dashboard",    tags=["dashboard"])
api_router.include_router(feedback_router,    prefix="/feedback",     tags=["feedback"])
api_router.include_router(career_roles_router, prefix="/career-roles", tags=["career-roles"])

from .learning_path import router as learning_path_router
from .recommendations import router as recommendations_router
from .skills import router as skills_router
from .builder import router as builder_router

api_router.include_router(learning_path_router, prefix="/learning-path", tags=["learning-path"])
api_router.include_router(recommendations_router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(skills_router, prefix="/skills", tags=["skills"])
api_router.include_router(builder_router, prefix="/builder", tags=["builder"])

from .jobs import router as jobs_router
from .reports import router as reports_router
api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])

# ── New: Candidate Dossier, XAI Rationale, Recruitment Pipeline ───────────────
from .candidates import router as candidates_router
from .xai import router as xai_router
from .pipeline import router as pipeline_router
from .jd import router as jd_router
api_router.include_router(candidates_router, prefix="/candidates", tags=["candidates"])
api_router.include_router(xai_router,        prefix="/xai",        tags=["xai"])
api_router.include_router(pipeline_router,   prefix="/pipeline",   tags=["pipeline"])
api_router.include_router(jd_router,         prefix="/jd",         tags=["jd"])
