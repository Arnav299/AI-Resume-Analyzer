# =============================================================================
# backend/app/routers/dashboard.py  — Dashboard endpoints
# =============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.routers.deps import get_current_student, get_current_mentor, get_current_admin, get_current_admin_or_recruiter
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.resume import Resume
from app.models.analysis_result import AnalysisResult
from app.models.career_role import CareerRole
from app.models.mentor_feedback import MentorFeedback
from app.models.jd import JobDescription
from app.models.pipeline_entry import PipelineEntry
from app.models.resume_parsed_data import ResumeParsedData
from app.services.opportunity_cost import calculate_opportunity_cost

router = APIRouter()


# ---------------------------------------------------------------------------
# GET /api/dashboard/student
# ---------------------------------------------------------------------------
@router.get("/student")
async def get_student_dashboard(
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """Return aggregated dashboard data for the currently authenticated student."""
    sp_result = await db.execute(
        select(StudentProfile).where(StudentProfile.user_id == current_user.id)
    )
    sp = sp_result.scalar_one_or_none()
    if not sp:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    res_result = await db.execute(
        select(Resume)
        .where(Resume.student_profile_id == sp.id)
        .order_by(desc(Resume.uploaded_at))
    )
    resumes = res_result.scalars().all()
    resume_ids = [r.id for r in resumes]

    latest_analysis = None
    analysis_history = []
    opportunity_cost_data = []

    if resume_ids:
        ar_result = await db.execute(
            select(AnalysisResult)
            .where(AnalysisResult.resume_id.in_(resume_ids))
            .order_by(desc(AnalysisResult.analyzed_at))
        )
        analyses = ar_result.scalars().all()

        for a in analyses:
            role_result = await db.execute(
                select(CareerRole).where(CareerRole.id == a.target_role_id)
            )
            role = role_result.scalar_one_or_none()
            role_name = role.role_name if role else "Unknown"
            
            parsed_data_result = await db.execute(
                select(ResumeParsedData).where(ResumeParsedData.resume_id == a.resume_id)
            )
            parsed_data = parsed_data_result.scalar_one_or_none()

            entry = {
                "id":              str(a.id),
                "resume_id":       str(a.resume_id),
                "target_role":     role_name,
                "readiness_score": float(a.readiness_score),
                "skill_score":     float(a.skill_score),
                "project_score":   float(a.project_score),
                "professional_presence_score": float(a.professional_presence_score),
                "strengths":       a.strengths,
                "weaknesses":      a.weaknesses,
                "recommendation_summary": a.recommendation_summary,
                "matched_skills":  a.matched_skills or [],
                "missing_skills":  a.missing_skills or [],
                "extracted_skills": a.extracted_skills or [],
                "soft_skills":     a.soft_skills or [],
                "learning_plan":   a.learning_plan or [],
                "quick_wins":      a.quick_wins or [],
                "analyzed_at":     a.analyzed_at,
                "education":       parsed_data.education_summary if parsed_data else "",
                "experience":      parsed_data.experience_summary if parsed_data else "",
            }

            if latest_analysis is None:
                fb_result = await db.execute(
                    select(MentorFeedback)
                    .where(MentorFeedback.analysis_result_id == a.id)
                    .order_by(desc(MentorFeedback.created_at))
                    .limit(1)
                )
                fb = fb_result.scalar_one_or_none()
                if fb:
                    entry["mentor_feedback"] = {
                        "id":                  str(fb.id),
                        "rating":              fb.rating,
                        "comments":            fb.comments,
                        "improvement_actions": fb.improvement_actions,
                        "created_at":          fb.created_at,
                    }
                latest_analysis = entry

            analysis_history.append(entry)

        all_roles_result = await db.execute(select(CareerRole).where(CareerRole.is_active == True))
        all_roles = all_roles_result.scalars().all()

        if latest_analysis and analyses:
            la = analyses[0]
            extracted_skills = la.strengths or []
            roles_list = [
                {"id": str(r.id), "role_name": r.role_name, "required_skills": []}
                for r in all_roles
            ]
            opportunity_cost_data = calculate_opportunity_cost(extracted_skills, roles_list)

    avg_score = None
    latest_score = None
    if resume_ids:
        ar2 = await db.execute(
            select(AnalysisResult)
            .where(AnalysisResult.resume_id.in_(resume_ids))
            .order_by(desc(AnalysisResult.analyzed_at))
        )
        all_analyses = ar2.scalars().all()
        scores = [float(a.readiness_score) for a in all_analyses]
        avg_score    = round(sum(scores) / len(scores), 2) if scores else None
        latest_score = scores[0] if scores else None

    return {
        "student_id":       str(sp.id),
        "full_name":        current_user.full_name,
        "total_resumes":    len(resumes),
        "latest_score":     latest_score,
        "average_score":    avg_score,
        "latest_analysis":  latest_analysis,
        "analysis_history": analysis_history,
        "opportunity_cost": opportunity_cost_data,
    }


# ---------------------------------------------------------------------------
# GET /api/dashboard/mentor
# ---------------------------------------------------------------------------
@router.get("/mentor")
async def get_mentor_dashboard(
    current_user: User = Depends(get_current_mentor),
    db: AsyncSession = Depends(get_db),
):
    """Return dashboard data for a mentor — lists all students and their status."""
    sp_result = await db.execute(select(StudentProfile))
    students = sp_result.scalars().all()

    student_data = []
    for sp in students:
        user_result = await db.execute(select(User).where(User.id == sp.user_id))
        user = user_result.scalar_one_or_none()

        res_result = await db.execute(
            select(Resume)
            .where(Resume.student_profile_id == sp.id)
            .order_by(desc(Resume.uploaded_at))
            .limit(1)
        )
        latest_resume = res_result.scalar_one_or_none()

        latest_readiness = None
        latest_analysis_id = None
        analysis_status = "No Resume"
        feedback_status = "N/A"

        if latest_resume:
            analysis_status = "Pending"
            ar_result = await db.execute(
                select(AnalysisResult)
                .where(AnalysisResult.resume_id == latest_resume.id)
                .order_by(desc(AnalysisResult.analyzed_at))
                .limit(1)
            )
            la = ar_result.scalar_one_or_none()
            if la:
                latest_analysis_id = str(la.id)
                latest_readiness   = float(la.readiness_score)
                analysis_status    = "Completed"

                fb_result = await db.execute(
                    select(MentorFeedback)
                    .where(MentorFeedback.analysis_result_id == la.id)
                    .limit(1)
                )
                feedback_status = "Completed" if fb_result.scalar_one_or_none() else "Pending"

        student_data.append({
            "student_id":              str(sp.id),
            "full_name":               user.full_name if user else "Unknown",
            "email":                   user.email if user else "N/A",
            "latest_readiness_score":  latest_readiness,
            "latest_analysis_id":      latest_analysis_id,
            "analysis_status":         analysis_status,
            "feedback_status":         feedback_status,
        })

    return {"mentor_id": str(current_user.id), "students": student_data}


# ---------------------------------------------------------------------------
# GET /api/dashboard/admin — Real-time (no cache)
# ---------------------------------------------------------------------------
@router.get("/admin")
async def get_admin_dashboard(
    current_user: User = Depends(get_current_admin_or_recruiter),
    db: AsyncSession = Depends(get_db),
):
    """Return platform-wide aggregate statistics (real-time, no cache)."""
    total_students = (await db.execute(select(func.count(StudentProfile.id)))).scalar_one()
    total_resumes  = (await db.execute(select(func.count(Resume.id)))).scalar_one()
    total_analyses = (await db.execute(select(func.count(AnalysisResult.id)))).scalar_one()
    avg_score = round(float((await db.execute(select(func.avg(AnalysisResult.readiness_score)))).scalar_one() or 0), 2)

    return {
        "admin_id":            str(current_user.id),
        "total_students":      total_students,
        "total_resumes":       total_resumes,
        "total_analyses":      total_analyses,
        "avg_readiness_score": avg_score,
    }


# ---------------------------------------------------------------------------
# GET /api/dashboard/recruiter — Real-time recruiter stats
# ---------------------------------------------------------------------------
@router.get("/recruiter")
async def get_recruiter_dashboard(
    current_user: User = Depends(get_current_admin_or_recruiter),
    db: AsyncSession = Depends(get_db),
):
    """Return real-time recruiter-specific stats: JDs, pipeline counts, resumes, activities."""

    total_jds  = (await db.execute(select(func.count(JobDescription.id)))).scalar_one() or 0
    active_jds = (await db.execute(
        select(func.count(JobDescription.id)).where(JobDescription.status == "Active")
    )).scalar_one() or 0

    total_resumes  = (await db.execute(select(func.count(Resume.id)))).scalar_one() or 0
    total_analyses = (await db.execute(select(func.count(AnalysisResult.id)))).scalar_one() or 0

    # Pending = resumes without any analysis
    analyzed_ids = {str(r) for r in (await db.execute(
        select(AnalysisResult.resume_id).distinct()
    )).scalars().all()}
    all_resume_ids = [str(r) for r in (await db.execute(select(Resume.id))).scalars().all()]
    pending_analysis = len([rid for rid in all_resume_ids if rid not in analyzed_ids])

    # Pipeline stage counts
    try:
        pipeline_rows = (await db.execute(
            select(PipelineEntry.stage, func.count(PipelineEntry.id)).group_by(PipelineEntry.stage)
        )).all()
        pipeline_counts = {row[0]: row[1] for row in pipeline_rows}
    except Exception:
        pipeline_counts = {}

    # ── Shortlisted / Rejected / Selected counts ──────────────────────────────
    # Score-based shortlisting: overall_match_score >= 80 → Shortlisted
    # (mirrors the rule in candidates.py and score_engine.py)
    _SHORTLIST_THRESHOLD = 80
    _BORDERLINE_THRESHOLD = 65

    shortlisted = (await db.execute(
        select(func.count(AnalysisResult.id))
        .where(AnalysisResult.overall_match_score >= _SHORTLIST_THRESHOLD)
    )).scalar_one() or 0

    rejected_by_score = (await db.execute(
        select(func.count(AnalysisResult.id))
        .where(AnalysisResult.overall_match_score < _BORDERLINE_THRESHOLD)
    )).scalar_one() or 0

    # Add manually-rejected pipeline entries not already counted
    rejected_pipeline = pipeline_counts.get("rejected", 0)
    rejected = max(rejected_by_score, rejected_pipeline)

    # "Selected" = manually moved to offer/hired stage
    selected    = pipeline_counts.get("offer", 0) + pipeline_counts.get("hired", 0)

    avg_score = round(float((await db.execute(
        select(func.avg(AnalysisResult.readiness_score))
    )).scalar_one() or 0), 2)

    # Recent 7 resumes
    recent_resumes = (await db.execute(
        select(Resume).order_by(desc(Resume.uploaded_at)).limit(7)
    )).scalars().all()
    recent_resume_data = [
        {"id": str(r.id), "filename": r.original_filename, "uploaded_at": str(r.uploaded_at)}
        for r in recent_resumes
    ]

    # Generate dynamic recent activity timeline from recent database events
    recent_activities = []
    for r in recent_resumes[:3]:
        recent_activities.append({
            "title": "New Resume Uploaded",
            "desc": f"Candidate resume '{r.original_filename}' uploaded to platform",
            "time": str(r.uploaded_at),
            "type": "upload"
        })
    if total_analyses > 0:
        recent_activities.append({
            "title": "AI Analysis Completed",
            "desc": f"Automated scoring completed for candidate pool ({total_analyses} total analyses)",
            "time": "Recently",
            "type": "ai"
        })
    if total_jds > 0:
        recent_activities.append({
            "title": "Job Description Active",
            "desc": f"{active_jds} active position(s) currently open for evaluation",
            "time": "Active",
            "type": "jd"
        })

    # Recruiter summary object
    recruiter_stats_summary = {
        "total_jobs": total_jds,
        "active_jobs": active_jds,
        "total_candidates": total_resumes,
        "resumes_uploaded": total_resumes,
        "pending_analysis": pending_analysis,
        "completed_analysis": total_analyses,
        "shortlisted": shortlisted,
        "selected": selected,
        "rejected": rejected,
        "avg_readiness_score": avg_score,
    }

    return {
        "total_jds":              total_jds,
        "total_jobs":             total_jds,
        "active_jds":             active_jds,
        "active_jobs":            active_jds,
        "total_resumes":          total_resumes,
        "total_candidates":       total_resumes,
        "candidates_analyzed":    total_analyses,
        "completed_analyses":     total_analyses,
        "pending_analysis":       pending_analysis,
        "pending_candidates":     pending_analysis,
        "shortlisted":            shortlisted,
        "shortlisted_candidates": shortlisted,
        "rejected":               rejected,
        "rejected_candidates":    rejected,
        "selected":               selected,
        "selected_candidates":    selected,
        "avg_readiness_score":    avg_score,
        "recent_resumes":         recent_resume_data,
        "recent_activities":       recent_activities,
        "recruiter_stats":        recruiter_stats_summary,
    }
