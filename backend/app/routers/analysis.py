# =============================================================================
# backend/app/routers/analysis.py  — Analysis retrieval endpoints
# =============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User, UserRole
from app.models.analysis_result import AnalysisResult
from app.models.resume import Resume
from app.models.student_profile import StudentProfile
from app.schemas.analysis import AnalysisResponse, AnalysisDetailResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# GET /api/analysis/latest/{resume_id}
# ---------------------------------------------------------------------------
@router.get("/latest/{resume_id}", response_model=AnalysisDetailResponse)
async def get_latest_analysis(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the most recent analysis result for a given resume."""
    # Verify resume exists
    res_result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = res_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Permission: students can only access their own resumes
    if current_user.role == UserRole.student:
        sp_result = await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        )
        sp = sp_result.scalar_one_or_none()
        if not sp or resume.student_profile_id != sp.id:
            raise HTTPException(status_code=403, detail="Access denied.")

    # Fetch latest analysis
    analysis_result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == resume_id)
        .order_by(desc(AnalysisResult.analyzed_at))
        .limit(1)
    )
    analysis = analysis_result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this resume.")
    return analysis


# ---------------------------------------------------------------------------
# GET /api/analysis/history/{resume_id}
# ---------------------------------------------------------------------------
@router.get("/history/{resume_id}")
async def get_analysis_history(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all analysis results for a given resume, newest first."""
    res_result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = res_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if current_user.role == UserRole.student:
        sp_result = await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        )
        sp = sp_result.scalar_one_or_none()
        if not sp or resume.student_profile_id != sp.id:
            raise HTTPException(status_code=403, detail="Access denied.")

    history_result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == resume_id)
        .order_by(desc(AnalysisResult.analyzed_at))
    )
    analyses = history_result.scalars().all()
    return [
        {
            "id":              str(a.id),
            "target_role_id":  str(a.target_role_id),
            "readiness_score": float(a.readiness_score),
            "analyzed_at":     a.analyzed_at,
        }
        for a in analyses
    ]


# ---------------------------------------------------------------------------
# GET /api/analysis/{analysis_id}
# ---------------------------------------------------------------------------
@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return a single analysis result by ID."""
    result = await db.execute(
        select(AnalysisResult, Resume)
        .join(Resume, AnalysisResult.resume_id == Resume.id)
        .where(AnalysisResult.id == analysis_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    
    analysis, resume = row

    # Permission: students can only access their own resumes
    if current_user.role == UserRole.student:
        sp_result = await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == current_user.id)
        )
        sp = sp_result.scalar_one_or_none()
        if not sp or resume.student_profile_id != sp.id:
            raise HTTPException(status_code=403, detail="Access denied.")

    return analysis
