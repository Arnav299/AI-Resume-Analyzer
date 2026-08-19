# =============================================================================
# backend/app/routers/candidates.py
# Provides the /api/candidates/* endpoints for the Candidate 360° Dossier page.
# All data is read from existing tables (Resume, ResumeParsedData, ResumeSkill,
# StudentProfile, User) — no new DB schema required.
# =============================================================================
from __future__ import annotations

import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import get_settings
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.resume_parsed_data import ResumeParsedData
from app.models.resume_skill import ResumeSkill
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.models.pipeline_entry import PipelineEntry
from app.models.analysis_result import AnalysisResult
import logging

logger = logging.getLogger(__name__)

settings = get_settings()
router = APIRouter()


# ── helpers ──────────────────────────────────────────────────────────────────

def _resume_url(file_path: str) -> str | None:
    """Convert an on-disk file path to a URL the browser can fetch."""
    if not file_path:
        return None
    # Normalize backslashes
    rel = file_path.replace("\\", "/")
    # Strip leading upload dir prefix so we return e.g. /uploads/filename.pdf
    upload_dir = settings.UPLOAD_DIR.replace("\\", "/").rstrip("/")
    if rel.startswith(upload_dir):
        rel = rel[len(upload_dir):]
    if not rel.startswith("/"):
        rel = "/" + rel
    return f"/uploads{rel}" if not rel.startswith("/uploads") else rel


async def _get_pipeline_stage(db: AsyncSession, resume_id: str) -> str:
    result = await db.execute(
        select(PipelineEntry).where(PipelineEntry.resume_id == resume_id)
    )
    entry = result.scalar_one_or_none()
    return entry.stage if entry else "new"


# Shortlisting thresholds (must match score_engine.py)
_SHORTLIST_THRESHOLD = 80
_BORDERLINE_THRESHOLD = 65


def _derive_status_from_score(overall_score: float | None, pipeline_stage: str) -> str:
    """
    Determine candidate status:
    1. If pipeline stage is 'rejected' — always Rejected (manual override wins).
    2. If overall_score >= 80 — Shortlisted.
    3. If overall_score >= 65 — Borderline.
    4. If overall_score < 65  — Rejected.
    5. If no score yet        — Pending.
    """
    # Manual rejection always wins
    if pipeline_stage == "rejected":
        return "Rejected"
    if overall_score is None:
        # Pipeline stages that indicate progress
        stage_map = {
            "offer":     "Shortlisted",
            "hired":     "Shortlisted",
            "interview": "Pending",
            "screening": "Pending",
            "new":       "Pending",
        }
        return stage_map.get(pipeline_stage, "Pending")
    # Score-based decision
    if overall_score >= _SHORTLIST_THRESHOLD:
        return "Shortlisted"
    elif overall_score >= _BORDERLINE_THRESHOLD:
        return "Borderline"
    else:
        return "Rejected"


async def _build_candidate_dict(
    resume: Resume,
    db: AsyncSession,
    include_extracted_text: bool = False,
) -> dict:
    """Assemble a unified candidate dict from related models."""
    # Parsed data (may be None if resume hasn't been processed yet)
    pd_result = await db.execute(
        select(ResumeParsedData).where(ResumeParsedData.resume_id == resume.id)
    )
    pd: ResumeParsedData | None = pd_result.scalar_one_or_none()

    # Student profile → contact info
    sp_result = await db.execute(
        select(StudentProfile).where(StudentProfile.id == resume.student_profile_id)
    )
    sp: StudentProfile | None = sp_result.scalar_one_or_none()

    # Owner user → name & email
    user: User | None = None
    if sp:
        u_result = await db.execute(select(User).where(User.id == sp.user_id))
        user = u_result.scalar_one_or_none()

    # Skills (via ResumeSkill → Skill)
    sk_result = await db.execute(
        select(Skill.skill_name)
        .join(ResumeSkill, ResumeSkill.skill_id == Skill.id)
        .where(ResumeSkill.resume_id == resume.id)
    )
    skills: list[str] = [row[0] for row in sk_result.all()]

    # Pipeline stage
    stage = await _get_pipeline_stage(db, resume.id)

    # Latest analysis result — used for score-based status determination
    ar_result = await db.execute(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == resume.id)
        .order_by(AnalysisResult.analyzed_at.desc())
        .limit(1)
    )
    analysis: AnalysisResult | None = ar_result.scalar_one_or_none()
    overall_score = float(analysis.overall_match_score) if analysis and analysis.overall_match_score is not None else None

    # Candidate name (prefer parsed > user.full_name > filename)
    name = (
        (pd.extracted_name if pd else None)
        or (user.full_name if user else None)
        or resume.original_filename
    )
    # Avatar initials
    parts = name.split() if name else []
    avatar = "".join(p[0].upper() for p in parts[:2]) if len(parts) >= 2 else (name[:2].upper() if name else "?")

    # Derive status: score-based rule (≥80 Shortlisted, 65-79 Borderline, <65 Rejected)
    # Manual 'rejected' pipeline stage overrides score-based decision.
    derived_status = _derive_status_from_score(overall_score, stage)
    logger.info(
        f"[CANDIDATE STATUS] resume_id={resume.id} | "
        f"overall_score={overall_score} | pipeline_stage={stage} | "
        f"derived_status={derived_status}"
    )

    candidate = {
        "id": resume.id,
        "name": name,
        "email": (pd.extracted_email if pd else None) or (user.email if user else None),
        "phone": (pd.extracted_phone if pd else None) or (sp.phone if sp else None),
        "location": None,  # not stored — would need a new field
        "linkedin": sp.linkedin_url if sp else None,
        "github": sp.github_url if sp else None,
        "avatar": avatar,
        "currentTitle": None,  # not in current schema
        "experience": pd.experience_summary if pd else None,
        "education": pd.education_summary if pd else None,
        "resumeUrl": _resume_url(resume.file_path),
        "uploadedAt": resume.uploaded_at.isoformat() if resume.uploaded_at else None,
        "status": derived_status,
        "jdTitle": None,
        "skills": skills,
        # Pipeline stage (raw, for Kanban)
        "stage": stage,
        "role": resume.original_filename,  # best proxy for role without JD linking
        # Score from latest analysis
        "score": overall_score,
        "overallScore": overall_score,
        "ats": overall_score,
    }

    if include_extracted_text:
        candidate["extractedText"] = pd.extracted_text if pd else None

    return candidate


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/", summary="List all candidates")
async def list_candidates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns a lightweight list of all uploaded resumes as candidate objects.
    Suitable for the Kanban board and recruiter views.
    """
    result = await db.execute(
        select(Resume).where(Resume.is_active == True).order_by(Resume.uploaded_at.desc())
    )
    resumes = result.scalars().all()

    candidates = []
    for r in resumes:
        c = await _build_candidate_dict(r, db, include_extracted_text=False)
        candidates.append(c)

    return candidates


@router.get("/{candidate_id}", summary="Get candidate summary")
async def get_candidate(
    candidate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Resume).where(Resume.id == candidate_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return await _build_candidate_dict(resume, db, include_extracted_text=False)


@router.get("/{candidate_id}/dossier", summary="Get full 360° candidate dossier")
async def get_candidate_dossier(
    candidate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Full dossier including extracted resume text, skills, and contact info.
    Used by the CandidateDossier page.
    """
    result = await db.execute(select(Resume).where(Resume.id == candidate_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return await _build_candidate_dict(resume, db, include_extracted_text=True)


@router.patch("/{candidate_id}/status", summary="Update candidate pipeline status")
async def update_candidate_status(
    candidate_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the status/stage of a candidate.
    Accepts { "status": "Shortlisted" | "Rejected" | "Pending" }
    and maps to pipeline stage.
    """
    new_status: str = body.get("status", "Pending")

    # Map UI status labels to pipeline stages
    status_to_stage = {
        "shortlisted": "offer",
        "rejected": "rejected",
        "pending": "screening",
        "borderline": "screening",
    }
    stage = status_to_stage.get(new_status.lower(), "screening")

    # Verify resume exists
    result = await db.execute(select(Resume).where(Resume.id == candidate_id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Upsert pipeline entry
    pe_result = await db.execute(
        select(PipelineEntry).where(PipelineEntry.resume_id == candidate_id)
    )
    pe = pe_result.scalar_one_or_none()
    if pe:
        pe.stage = stage
    else:
        pe = PipelineEntry(resume_id=candidate_id, stage=stage)
        db.add(pe)

    await db.commit()
    return {"id": candidate_id, "status": new_status, "stage": stage}
