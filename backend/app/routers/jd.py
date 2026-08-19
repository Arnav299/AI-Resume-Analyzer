# =============================================================================
# backend/app/routers/jd.py  — Job Description Studio controller
# =============================================================================
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.jd import JobDescription
from app.schemas.jd import JDCreate, JDUpdate, JDResponse

router = APIRouter()


@router.post("/", response_model=JDResponse, status_code=status.HTTP_201_CREATED)
async def create_jd(
    data: JDCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Job Description in JD Studio."""
    # Prevent duplicate requisitions
    result = await db.execute(
        select(JobDescription).where(
            JobDescription.user_id == current_user.id,
            JobDescription.title == data.title
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="A requisition with this title already exists.")

    jd = JobDescription(
        user_id=current_user.id,
        title=data.title,
        company=data.company,
        domain=data.domain,
        department=data.department,
        location=data.location,
        employment_type=data.employmentType,
        work_mode=data.workMode,
        salary=data.salary,
        experience_level=data.experienceLevel,
        education=data.education,
        description=data.description,
        requirements=data.requirements,
        benefits=data.benefits,
        skills=data.skills or [],
        preferred_skills=data.preferredSkills or [],
        certifications=data.certifications or [],
        weights=data.weights or {},
        ai_matching_threshold=data.aiMatchingThreshold,
        selected_threshold=data.selectedThreshold,
        waiting_threshold=data.waitingThreshold,
        status=data.status,
    )
    db.add(jd)
    await db.commit()
    await db.refresh(jd)
    return jd


@router.get("/", response_model=List[JDResponse])
async def list_jds(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all Job Descriptions for the current user."""
    result = await db.execute(
        select(JobDescription)
        .where(JobDescription.user_id == current_user.id)
        .order_by(JobDescription.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{jd_id}", response_model=JDResponse)
async def get_jd(
    jd_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific Job Description by ID."""
    result = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found")
    return jd


@router.put("/{jd_id}", response_model=JDResponse)
async def update_jd(
    jd_id: str,
    data: JDUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Job Description."""
    result = await db.execute(
        select(JobDescription).where(
            JobDescription.id == jd_id, JobDescription.user_id == current_user.id
        )
    )
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found or unauthorized")

    if data.title is not None:
        jd.title = data.title
    if data.company is not None:
        jd.company = data.company
    if data.domain is not None:
        jd.domain = data.domain
    if data.department is not None:
        jd.department = data.department
    if data.location is not None:
        jd.location = data.location
    if data.employmentType is not None:
        jd.employment_type = data.employmentType
    if data.workMode is not None:
        jd.work_mode = data.workMode
    if data.salary is not None:
        jd.salary = data.salary
    if data.experienceLevel is not None:
        jd.experience_level = data.experienceLevel
    if data.education is not None:
        jd.education = data.education
    if data.description is not None:
        jd.description = data.description
    if data.requirements is not None:
        jd.requirements = data.requirements
    if data.benefits is not None:
        jd.benefits = data.benefits
    if data.skills is not None:
        jd.skills = data.skills
    if data.preferredSkills is not None:
        jd.preferred_skills = data.preferredSkills
    if data.certifications is not None:
        jd.certifications = data.certifications
    if data.weights is not None:
        jd.weights = data.weights
    if data.aiMatchingThreshold is not None:
        jd.ai_matching_threshold = data.aiMatchingThreshold
    if data.selectedThreshold is not None:
        jd.selected_threshold = data.selectedThreshold
    if data.waitingThreshold is not None:
        jd.waiting_threshold = data.waitingThreshold
    if data.status is not None:
        jd.status = data.status

    await db.commit()
    await db.refresh(jd)
    return jd


@router.delete("/{jd_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_jd(
    jd_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a Job Description."""
    result = await db.execute(
        select(JobDescription).where(
            JobDescription.id == jd_id, JobDescription.user_id == current_user.id
        )
    )
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found or unauthorized")

    await db.delete(jd)
    await db.commit()


@router.post("/{jd_id}/rank", status_code=status.HTTP_200_OK)
async def rank_candidates(
    jd_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Run the AI Candidate Ranking Engine for a specific Job Description.
    Fetches ALL analysis results stored in the DB for this JD, sorts them
    using the multi-level tie-breaking rules, and updates ai_rank, percentile,
    and selection_status in the database.
    """
    from app.models.analysis_result import AnalysisResult

    # 1. Fetch the JD to read configurable thresholds
    result = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = result.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found")

    selected_threshold = float(jd.selected_threshold or 90)
    waiting_threshold = float(jd.waiting_threshold or 75)

    # 2. Fetch all analysis results for this JD, ranked by tie-breaking rules:
    #    a) Match Score (readiness_score) DESC
    #    b) Skills Match (skill_score)    DESC
    #    c) Relevant Experience (project_score) DESC
    #    d) Education (education_score)   DESC
    results_q = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.target_jd_id == jd_id)
        .order_by(
            AnalysisResult.readiness_score.desc(),
            AnalysisResult.skill_score.desc(),
            AnalysisResult.project_score.desc(),
            AnalysisResult.education_score.desc(),
        )
    )
    candidates = results_q.scalars().all()

    total_candidates = len(candidates)
    if total_candidates == 0:
        return {"message": "No candidates to rank", "processed": 0}

    # 3. Assign rank, percentile and selection_status
    for idx, candidate in enumerate(candidates):
        rank = idx + 1
        candidate.ai_rank = rank
        candidate.percentile = round(
            ((total_candidates - rank) / total_candidates) * 100, 2
        )
        # Cast to float to safely compare Decimal DB type with float thresholds
        score = float(candidate.readiness_score or 0)
        if score >= selected_threshold:
            candidate.selection_status = "✅ Selected"
        elif score >= waiting_threshold:
            candidate.selection_status = "⏳ Waiting Review"
        else:
            candidate.selection_status = "❌ Not Selected"

    # 4. Persist changes
    await db.commit()

    return {
        "message": "Ranking engine completed successfully",
        "processed": total_candidates,
        "selected_threshold": selected_threshold,
        "waiting_threshold": waiting_threshold,
    }
