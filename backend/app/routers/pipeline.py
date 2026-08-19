# =============================================================================
# backend/app/routers/pipeline.py
# Recruitment Pipeline (Kanban) endpoints.
# GET  /pipeline/candidates        — all candidates with their stage
# PATCH /pipeline/candidates/{id}/stage — move candidate to a new stage
# GET  /pipeline/stats             — summary counts per stage
# POST /pipeline/scorecards        — save an interview scorecard
# GET  /pipeline/scorecards/{id}   — retrieve scorecard for a candidate
# =============================================================================
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_parsed_data import ResumeParsedData
from app.models.resume_skill import ResumeSkill
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.models.analysis_result import AnalysisResult
from app.models.pipeline_entry import PipelineEntry, PIPELINE_STAGES
from app.models.interview_scorecard import InterviewScorecard

router = APIRouter()


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class MoveStageBody(BaseModel):
    stage: str

class ScorecardBody(BaseModel):
    candidateId: str
    ratings: dict | None = None
    notes: dict | None = None
    recommendation: str | None = None
    overallNotes: str | None = None
    overallScore: float = 0.0
    savedAt: str | None = None


# ── helpers ───────────────────────────────────────────────────────────────────

async def _get_or_create_pipeline_entry(
    db: AsyncSession, resume_id: str
) -> PipelineEntry:
    result = await db.execute(
        select(PipelineEntry).where(PipelineEntry.resume_id == resume_id)
    )
    pe = result.scalar_one_or_none()
    if pe is None:
        pe = PipelineEntry(resume_id=resume_id, stage="new")
        db.add(pe)
        await db.flush()
    return pe


async def _get_resume_score(db: AsyncSession, resume_id: str) -> int | None:
    ar_result = await db.execute(
        select(AnalysisResult.readiness_score)
        .where(AnalysisResult.resume_id == resume_id)
        .order_by(desc(AnalysisResult.analyzed_at))
        .limit(1)
    )
    row = ar_result.first()
    return int(round(float(row[0]))) if row else None


async def _build_pipeline_candidate(
    resume: Resume, db: AsyncSession
) -> dict:
    pe = await _get_or_create_pipeline_entry(db, resume.id)

    # Parsed name/email
    pd_result = await db.execute(
        select(ResumeParsedData).where(ResumeParsedData.resume_id == resume.id)
    )
    pd: ResumeParsedData | None = pd_result.scalar_one_or_none()

    # Student profile → user
    sp_result = await db.execute(
        select(StudentProfile).where(StudentProfile.id == resume.student_profile_id)
    )
    sp: StudentProfile | None = sp_result.scalar_one_or_none()

    user_email = None
    user_name = None
    if sp:
        from app.models.user import User as UserModel
        u_res = await db.execute(select(UserModel).where(UserModel.id == sp.user_id))
        u = u_res.scalar_one_or_none()
        if u:
            user_email = u.email
            user_name = u.full_name

    name = (pd.extracted_name if pd else None) or user_name or resume.original_filename
    parts = name.split() if name else []
    avatar = "".join(p[0].upper() for p in parts[:2]) if len(parts) >= 2 else (name[:2].upper() if name else "?")

    score = await _get_resume_score(db, resume.id)

    return {
        "id": resume.id,
        "name": name,
        "role": resume.original_filename,
        "email": (pd.extracted_email if pd else None) or user_email,
        "avatar": avatar,
        "stage": pe.stage,
        "score": score if score is not None else 0,
    }


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/candidates", summary="List all candidates with pipeline stage")
async def list_pipeline_candidates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Resume).where(Resume.is_active == True).order_by(Resume.uploaded_at.desc())
    )
    resumes = result.scalars().all()

    candidates = []
    for r in resumes:
        c = await _build_pipeline_candidate(r, db)
        candidates.append(c)

    await db.commit()  # flush any newly created PipelineEntry rows
    return candidates


@router.patch("/candidates/{candidate_id}/stage", summary="Move candidate to a pipeline stage")
async def move_candidate_stage(
    candidate_id: str,
    body: MoveStageBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.stage not in PIPELINE_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage '{body.stage}'. Must be one of: {PIPELINE_STAGES}",
        )

    r = await db.execute(select(Resume).where(Resume.id == candidate_id))
    if not r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Candidate not found")

    pe = await _get_or_create_pipeline_entry(db, candidate_id)
    pe.stage = body.stage
    await db.commit()

    return {"id": candidate_id, "stage": body.stage}


@router.get("/stats", summary="Pipeline summary stats per stage")
async def get_pipeline_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total resumes
    total_result = await db.execute(
        select(func.count(Resume.id)).where(Resume.is_active == True)
    )
    total = total_result.scalar() or 0

    # Counts per stage
    stage_result = await db.execute(
        select(PipelineEntry.stage, func.count(PipelineEntry.id))
        .group_by(PipelineEntry.stage)
    )
    stage_counts = {row[0]: row[1] for row in stage_result.all()}

    return {
        "total": total,
        "stages": {s: stage_counts.get(s, 0) for s in PIPELINE_STAGES},
        "untracked": total - sum(stage_counts.values()),
    }


@router.post("/scorecards", summary="Save an interview scorecard", status_code=201)
async def save_scorecard(
    body: ScorecardBody,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify candidate exists
    r = await db.execute(select(Resume).where(Resume.id == body.candidateId))
    if not r.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Upsert — one scorecard per candidate (overwrite on re-save)
    existing_result = await db.execute(
        select(InterviewScorecard).where(
            InterviewScorecard.resume_id == body.candidateId
        )
    )
    sc: InterviewScorecard | None = existing_result.scalar_one_or_none()

    if sc:
        sc.ratings = body.ratings
        sc.notes = body.notes
        sc.recommendation = body.recommendation
        sc.overall_notes = body.overallNotes
        sc.overall_score = body.overallScore
        sc.interviewer_id = current_user.id
    else:
        sc = InterviewScorecard(
            resume_id=body.candidateId,
            interviewer_id=current_user.id,
            ratings=body.ratings,
            notes=body.notes,
            recommendation=body.recommendation,
            overall_notes=body.overallNotes,
            overall_score=body.overallScore,
        )
        db.add(sc)

    await db.commit()
    await db.refresh(sc)

    return {
        "id": sc.id,
        "candidateId": sc.resume_id,
        "ratings": sc.ratings,
        "notes": sc.notes,
        "recommendation": sc.recommendation,
        "overallNotes": sc.overall_notes,
        "overallScore": float(sc.overall_score),
        "savedAt": sc.saved_at.isoformat(),
    }


@router.get("/scorecards/{candidate_id}", summary="Get saved scorecard for a candidate")
async def get_scorecard(
    candidate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(InterviewScorecard).where(
            InterviewScorecard.resume_id == candidate_id
        )
    )
    sc: InterviewScorecard | None = result.scalar_one_or_none()

    if sc is None:
        # Return empty scorecard shape rather than 404 — frontend handles empty state
        return {
            "id": None,
            "candidateId": candidate_id,
            "ratings": {},
            "notes": {},
            "recommendation": None,
            "overallNotes": "",
            "overallScore": 0,
            "savedAt": None,
        }

    return {
        "id": sc.id,
        "candidateId": sc.resume_id,
        "ratings": sc.ratings or {},
        "notes": sc.notes or {},
        "recommendation": sc.recommendation,
        "overallNotes": sc.overall_notes or "",
        "overallScore": float(sc.overall_score),
        "savedAt": sc.saved_at.isoformat(),
    }
