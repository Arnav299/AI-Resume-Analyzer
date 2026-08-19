# =============================================================================
# backend/app/routers/resumes.py  — Resume upload + analysis pipeline
# =============================================================================
import os
import shutil
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.config import get_settings
from app.core.database import get_db
import structlog

logger = structlog.get_logger(__name__)
from app.routers.deps import get_current_student, get_current_user, get_current_admin_or_recruiter
from app.routers.jobs import update_job_status
from app.models.user import User
from app.models.resume import Resume, UploadStatus
from app.models.resume_parsed_data import ResumeParsedData
from app.models.student_profile import StudentProfile
from app.models.career_role import CareerRole
from app.models.analysis_result import AnalysisResult
from app.models.student_dashboard_metrics import StudentDashboardMetrics
from app.schemas.resume import ResumeResponse, ResumeUploadResponse
from app.schemas.analysis import AnalysisRequest, AnalysisDetailResponse, BulkAnalysisResponse

# AI pipeline services
from app.services.document_parser import extract_text_from_document
from app.services.image_parser import extract_text_from_image
from app.services.skill_extractor import extract_skills
from app.services.soft_skill_detector import detect_soft_skills
from app.services.gap_analysis import perform_gap_analysis
from app.services.completeness_checker import evaluate_completeness
from app.services.score_engine import (
    calculate_readiness_score, calculate_ats_score,
    get_status_from_score, get_status_from_thresholds,
    SHORTLIST_THRESHOLD, THRESHOLD_PARTIAL,
)
from app.services.recommendation_engine import generate_recommendations
from app.services.ai_resume_parser import parse_resume_with_ai
from app.services.resume_parser import parse_resume_text, split_sections, extract_experience_bullets, extract_years_of_experience, extract_candidate_name
from app.services.gap_analysis import normalize_skills as normalize_skill_list
from app.services.skill_extractor import extract_skills_from_jd_text

settings = get_settings()
router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def clean_filename(filename: str | None) -> str:
    if not filename:
        return "upload.pdf"
    cleaned = filename.replace("\\", "/").split("/")[-1]
    for ch in [':', '*', '?', '"', '<', '>', '|']:
        cleaned = cleaned.replace(ch, '_')
    return cleaned.strip() or "upload.pdf"


# ---------------------------------------------------------------------------
# POST /api/resumes/parse-image   (no auth — used by Resume Builder)
# ---------------------------------------------------------------------------
@router.post("/parse-image")
async def parse_resume_image(
    file: UploadFile = File(...),
):
    """
    OCR an uploaded image (PNG, JPG, JPEG) and return both the raw extracted
    text AND the AI-structured resume data. Intended for the Resume Builder's
    'Upload Image' button. No authentication required.
    """
    from app.services.image_parser import SUPPORTED_EXTENSIONS

    safe_filename = clean_filename(file.filename)
    ext = "." + safe_filename.rsplit(".", 1)[-1].lower() if "." in safe_filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(SUPPORTED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size must be less than 20 MB.")

    logger.info("parse_image.start", filename=safe_filename, size=len(content))

    extracted_text = await extract_text_from_image(content, safe_filename)

    logger.info("parse_image.extracted", chars=len(extracted_text))

    structured_data = await parse_resume_with_ai(extracted_text)

    return {"filename": safe_filename, "text": extracted_text, "data": structured_data}


# ---------------------------------------------------------------------------
# POST /api/resumes/parse-pdf-text  (no auth — used by Resume Builder)
# ---------------------------------------------------------------------------
@router.post("/parse-pdf-text")
async def parse_resume_pdf_text(
    file: UploadFile = File(...),
):
    """
    Extract raw text from an uploaded document (PDF/DOCX) and return it.
    Intended for the Resume Builder's 'Upload Resume' button.
    No authentication required.
    """
    safe_filename = clean_filename(file.filename)
    if not safe_filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are accepted by this endpoint.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 10 MB.")

    logger.info("parse_pdf_text.start", filename=safe_filename, size=len(content))

    extracted_text = await extract_text_from_document(content, safe_filename)

    logger.info("parse_pdf_text.extracted", chars=len(extracted_text))

    return {"filename": safe_filename, "text": extracted_text}


# ---------------------------------------------------------------------------
# POST /api/resumes/parse-structured  (no auth — used by Resume Builder)
# ---------------------------------------------------------------------------
@router.post("/parse-structured")
async def parse_resume_structured(
    file: UploadFile = File(...),
):
    """
    Extract raw text from an uploaded document (PDF/DOCX/DOC) and parse it into
    the fully structured JSON format required by the frontend Resume Builder.
    Uses Gemini AI for high-accuracy extraction with regex fallback.
    No authentication required.
    """
    safe_filename = clean_filename(file.filename)
    if not safe_filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are accepted by this endpoint.")

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 20 MB.")

    logger.info("parse_structured.start", filename=safe_filename, size=len(content))

    extracted_text = await extract_text_from_document(content, safe_filename)

    logger.info("parse_structured.extracted", chars=len(extracted_text))

    if not extracted_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any meaningful text from the document. Please try a different file.")

    structured_data = await parse_resume_with_ai(extracted_text)

    logger.info("parse_structured.complete", filename=safe_filename)

    # Return both raw text AND structured data so the frontend can populate
    # the Text Editor (raw text) and the Form Fields (structured data) simultaneously.
    return {"filename": safe_filename, "text": extracted_text, "data": structured_data}


# ---------------------------------------------------------------------------
# POST /api/resumes/reparse-text  (no auth — used by Resume Builder Text Editor)
# ---------------------------------------------------------------------------
from pydantic import BaseModel as PydanticBaseModel

class ReparseTextRequest(PydanticBaseModel):
    text: str

@router.post("/reparse-text")
async def reparse_resume_text(body: ReparseTextRequest):
    """
    Accept raw resume text (from the editable Text Editor) and run the AI
    parser on it to produce structured JSON. No authentication required.
    This is called every time the user edits text in the Resume Builder editor.
    """
    raw = body.text.strip()
    if not raw:
        raise HTTPException(status_code=422, detail="Text must not be empty.")
    if len(raw) > 50_000:
        raise HTTPException(status_code=422, detail="Text is too long (max 50,000 characters).")

    logger.info("reparse_text.start", chars=len(raw))
    structured_data = await parse_resume_with_ai(raw)
    logger.info("reparse_text.complete")
    return {"data": structured_data}


# ---------------------------------------------------------------------------
# POST /api/resumes/upload
# ---------------------------------------------------------------------------
@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF, DOC, or DOCX resume and immediately parse it into the database.
    Accessible by any authenticated user (students, recruiters, admins).
    """
    safe_filename = clean_filename(file.filename)
    if not safe_filename.lower().endswith((".pdf", ".doc", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are allowed.")

    from app.models.user import UserRole
    
    profile_id = None
    if current_user.role == UserRole.student:
        # --- Profile check or auto-create (needed for the Resume FK) ---
        result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if not profile:
            profile = StudentProfile(user_id=current_user.id, college_name="General Profile")
            db.add(profile)
            await db.flush()  # get profile.id without committing yet
        profile_id = profile.id

    # --- Read & validate file content ---
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 10 MB.")

    import time
    timestamp = int(time.time())
    file_location = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{timestamp}_{safe_filename}")
    with open(file_location, "wb") as fobj:
        fobj.write(content)

    file_size = os.path.getsize(file_location)
    ext = safe_filename.lower().rsplit(".", 1)[-1]
    mime_map = {
        "pdf": "application/pdf",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    file_type = mime_map.get(ext, "application/octet-stream")

    # --- Create Resume record ---
    resume = Resume(
        student_profile_id=profile_id,
        uploader_id=current_user.id,
        original_filename=safe_filename,
        file_path=file_location,
        file_size=file_size,
        file_type=file_type,
        upload_status=UploadStatus.processing,
    )
    db.add(resume)
    await db.flush()  # get resume.id without committing yet

    # --- Extract text & store parsed data ---
    try:
        extracted_text = await extract_text_from_document(content, safe_filename)
    except Exception as e:
        print(f"[upload_resume] Warning during text extraction: {e}")
        extracted_text = "Text extraction pending or unavailable."

    from app.services.resume_parser import parse_resume_text, split_sections, extract_experience_bullets, extract_years_of_experience
    parsed_fields = parse_resume_text(extracted_text)

    parsed = ResumeParsedData(
        resume_id=resume.id,
        extracted_text=extracted_text,
        extracted_name=extract_candidate_name(extracted_text, fallback_filename=safe_filename),
        extracted_email=parsed_fields.get("email") or current_user.email,
        extracted_phone=parsed_fields.get("phone") or "",
        education_summary=parsed_fields.get("education") or "",
        experience_summary=parsed_fields.get("experience") or "",
        projects_summary=parsed_fields.get("projects") or "",
        certifications_summary=parsed_fields.get("certifications") or "",
    )
    db.add(parsed)
    resume.upload_status = UploadStatus.uploaded
    # Note: get_db() dependency commits the transaction after this returns.

    return {
        "id": str(resume.id),
        "filename": resume.original_filename,
        "message": "Resume uploaded and parsed successfully.",
    }



# ---------------------------------------------------------------------------
# GET /api/resumes/
# ---------------------------------------------------------------------------
@router.get("/", response_model=List[ResumeResponse])
async def get_my_resumes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return resumes. Students see their own; recruiters/admins see all active resumes."""
    from app.models.user import UserRole
    if current_user.role in (UserRole.recruiter, UserRole.admin):
        # Recruiters and admins see all resumes
        result = await db.execute(
            select(Resume)
            .where(Resume.is_active == True)
            .order_by(desc(Resume.uploaded_at))
        )
    else:
        # Students see only their own
        result = await db.execute(
            select(Resume)
            .join(StudentProfile)
            .where(
                StudentProfile.user_id == current_user.id,
                Resume.is_active == True,
            )
            .order_by(desc(Resume.uploaded_at))
        )
    return result.scalars().all()


# ---------------------------------------------------------------------------
# DELETE /api/resumes/{resume_id}  — soft delete
# ---------------------------------------------------------------------------
@router.delete("/{resume_id}", status_code=204)
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_student),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a resume by setting is_active = False."""
    res_result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = res_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Ownership check
    sp_result = await db.execute(
        select(StudentProfile).where(StudentProfile.id == resume.student_profile_id)
    )
    sp = sp_result.scalar_one_or_none()
    if not sp or sp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorised to delete this resume.")

    resume.is_active = False
    await db.commit()


# ---------------------------------------------------------------------------
# POST /api/resumes/{resume_id}/analyze
# ---------------------------------------------------------------------------
async def analyze_resume_task(
    resume_id: str,
    target_role_id: str | None,
    target_jd_id: str | None,
    gemini_api_key: str,
    current_user_id: str,
    job_id: str
):
    """Background task to run the AI analysis."""
    import asyncio
    from app.core.database import AsyncSessionLocal
    import structlog
    logger = structlog.get_logger()
    
    update_job_status(job_id, "Processing")
    
    try:
        async with AsyncSessionLocal() as db:
            logger.info("Starting resume analysis task", resume_id=resume_id, target_role_id=target_role_id, job_id=job_id)
            
            # --- Fetch resume ---
            res_result = await db.execute(select(Resume).where(Resume.id == resume_id))
            resume = res_result.scalar_one_or_none()
            if not resume:
                update_job_status(job_id, "Failed", {"error": "Resume not found"})
                return

            sp_result = await db.execute(
                select(StudentProfile).where(StudentProfile.id == resume.student_profile_id)
            )
            sp = sp_result.scalar_one_or_none()

            # --- Fetch target role or target JD ---
            role = None
            jd = None
            required_skills = []
            target_name = "Target Role"
            
            if target_jd_id:
                from app.models.jd import JobDescription
                jd_result = await db.execute(select(JobDescription).where(JobDescription.id == target_jd_id))
                jd = jd_result.scalar_one_or_none()
                if not jd:
                    update_job_status(job_id, "Failed", {"error": "Job Description not found"})
                    return
                target_name = jd.title
                # Merge structured skill lists + any free-text description skills
                structured_skills = (jd.skills or []) + (jd.preferred_skills or [])
                jd_text_skills = await extract_skills_from_jd_text(jd.description or "")
                required_skills = list(set(structured_skills) | set(jd_text_skills))
                logger.info(
                    "[ANALYZE TASK] JD required skills extracted",
                    jd_id=target_jd_id,
                    structured_count=len(structured_skills),
                    text_extracted_count=len(jd_text_skills),
                    total_required=len(required_skills),
                )
            elif target_role_id:
                if target_role_id.startswith("custom::"):
                    custom_role_name = target_role_id.split("custom::", 1)[1].strip()
                    role_result = await db.execute(
                        select(CareerRole).where(CareerRole.role_name == custom_role_name)
                    )
                    role = role_result.scalar_one_or_none()
                    if not role:
                        role = CareerRole(
                            role_name=custom_role_name,
                            description="Custom career role created by user analysis",
                            industry_category="Custom",
                            is_active=True
                        )
                        db.add(role)
                        await db.commit()
                        await db.refresh(role)
                else:
                    role_result = await db.execute(
                        select(CareerRole).where(CareerRole.id == target_role_id)
                    )
                    role = role_result.scalar_one_or_none()
                    if not role:
                        update_job_status(job_id, "Failed", {"error": "Role not found"})
                        return
                
                target_name = role.role_name
                from app.models.role_skill import RoleSkill
                from app.models.skill import Skill
                rs_result = await db.execute(
                    select(Skill.skill_name)
                    .join(RoleSkill, RoleSkill.skill_id == Skill.id)
                    .where(RoleSkill.role_id == role.id)
                )
                required_skills = [row[0] for row in rs_result.all()]
            else:
                update_job_status(job_id, "Failed", {"error": "Must provide target_role_id or target_jd_id"})
                return

            # --- Fetch parsed text ---
            parsed_result = await db.execute(
                select(ResumeParsedData).where(ResumeParsedData.resume_id == resume.id)
            )
            parsed_data = parsed_result.scalar_one_or_none()

            if parsed_data and parsed_data.extracted_text:
                text = parsed_data.extracted_text
                logger.info("Retrieved extracted text from database", resume_id=resume.id)
            else:
                try:
                    with open(resume.file_path, "rb") as f:
                        raw_bytes = f.read()
                    text = await extract_text_from_document(raw_bytes, resume.original_filename)
                    logger.info("Extracted text from document file", resume_id=resume.id)
                except Exception as e:
                    logger.error("Failed to extract text from document", resume_id=resume.id, error=str(e))
                    text = ""

            # ── Extract and persist candidate name from resume content ────────
            from app.services.resume_parser import extract_candidate_name as _extract_name
            candidate_name = _extract_name(text, fallback_filename=resume.original_filename)
            # Update ResumeParsedData so Pipeline Board always shows the real name
            if parsed_data and candidate_name:
                parsed_data.extracted_name = candidate_name
            elif not parsed_data and candidate_name:
                # Create a minimal parsed record if none exists yet
                new_pd = ResumeParsedData(
                    resume_id=resume.id,
                    extracted_text=text,
                    extracted_name=candidate_name,
                )
                db.add(new_pd)

            if not text or not text.strip():
                logger.error("Resume text extraction failed or text is empty", resume_id=resume_id)
                update_job_status(job_id, "Failed", {"error": "Could not extract text from resume. Please ensure the file is a readable PDF/DOCX."})
                return

            resume.upload_status = UploadStatus.processing
            await db.commit()

            extracted_skills = await extract_skills(text)
            soft_skills = await detect_soft_skills(text)
            
            # Normalize required_skills before gap analysis to prevent false mismatches
            normalized_required = normalize_skill_list(required_skills)
            
            logger.info(
                "[ANALYZE TASK] Pre-gap analysis data",
                resume_id=resume_id,
                extracted_skills_count=len(extracted_skills),
                extracted_skills=extracted_skills,
                required_skills_count=len(normalized_required),
                required_skills=normalized_required,
            )
            
            gap = await perform_gap_analysis(extracted_skills, normalized_required, resume_text=text)
            matched_skills = gap["matched_skills"]
            missing_skills = gap["missing_skills"]
            semantic_matches = gap.get("semantic_matches", {})
            extra_skills = gap.get("extra_skills", [])
            
            logger.info(
                "[ANALYZE TASK] Gap analysis complete",
                resume_id=resume_id,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                match_rate=gap["match_rate"],
            )
            
            comp = await evaluate_completeness(text)
            
            if jd:
                parsed_data = parse_resume_text(text)
                cand_certs_raw = parsed_data.get("certifications", "")
                cand_certs = [c.strip() for c in cand_certs_raw.split(",")] if cand_certs_raw else []
                
                scores = await calculate_ats_score(
                    resume_text=text,
                    required_skills=normalized_required,
                    preferred_skills=normalize_skill_list(jd.preferred_skills or []),
                    matched_skills=matched_skills,
                    missing_skills=missing_skills,
                    jd_description=jd.description or "",
                    jd_requirements=jd.requirements or "",
                    jd_experience_level=jd.experience_level or "",
                    jd_education=jd.education or "",
                    jd_certifications=jd.certifications or [],
                    experience_bullets=extract_experience_bullets(text),
                    years_experience=extract_years_of_experience(text),
                    candidate_certifications=cand_certs,
                    semantic_matches=semantic_matches,
                    jd_location=jd.location or "",
                    candidate_location=parsed_data.get("location", "") or parsed_data.get("address", "") or ""
                )
                
                # Use JD's configured threshold; default is SHORTLIST_THRESHOLD (80)
                sel_thresh = int(jd.selected_threshold) if getattr(jd, 'selected_threshold', None) else SHORTLIST_THRESHOLD
                wait_thresh = int(jd.waiting_threshold) if getattr(jd, 'waiting_threshold', None) else THRESHOLD_PARTIAL
                logger.info(
                    f"[ANALYZE TASK] Calling get_status_from_thresholds: "
                    f"final_ats_score={scores['final_ats_score']:.2f}, "
                    f"sel_thresh={sel_thresh}, wait_thresh={wait_thresh}"
                )
                cand_status = get_status_from_thresholds(scores["final_ats_score"], sel_thresh, wait_thresh)
            else:
                # No JD — compute a readiness score against the role's required skills
                scores = await calculate_readiness_score(text, matched_skills, normalized_required)
                logger.info(
                    f"[ANALYZE TASK] No JD — using SHORTLIST_THRESHOLD={SHORTLIST_THRESHOLD} for status. "
                    f"readiness_score={scores['readiness_score']:.2f}"
                )
                cand_status = get_status_from_score(scores["readiness_score"], SHORTLIST_THRESHOLD)
            
            api_key_to_use = gemini_api_key or settings.GEMINI_API_KEY
            recs = await generate_recommendations(
                missing_skills=missing_skills,
                matched_skills=matched_skills,
                readiness_score=scores["readiness_score"],
                resume_text=text,
                target_role_name=target_name,
                api_key=api_key_to_use,
                extracted_skills=extracted_skills,
            )

            if not required_skills and recs:
                if "inferred_skills" in recs:
                    matched_skills = recs.get("inferred_matched_skills", recs.get("inferred_skills", []))
                    missing_skills = recs.get("inferred_missing_skills", [])
                if "inferred_scores" in recs:
                    inferred_s = recs["inferred_scores"]
                    scores["readiness_score"] = float(inferred_s.get("readiness_score", scores["readiness_score"]))
                    scores["skill_score"] = float(inferred_s.get("skill_score", scores.get("skill_score", 0)))
                    scores["project_score"] = float(inferred_s.get("project_score", scores.get("project_score", 0)))
                    scores["professional_presence_score"] = float(inferred_s.get("presence_score", scores.get("professional_presence_score", 0)))
                    
            overall_match_score = float(scores.get("overall_match_score", scores["readiness_score"]))
            experience_score = float(scores.get("experience_score", 0.0))
            education_score = float(scores.get("education_score", 0.0))
            project_score = float(scores.get("project_score", scores.get("project_cert_score", 0.0)))

            
            logger.info(
                "[ANALYZE TASK] Scoring complete",
                resume_id=resume_id,
                readiness_score=overall_match_score,
                skill_score=scores["skill_score"],
                skill_score_pct=scores.get("skill_score_pct", 0),
                experience_score=experience_score,
                education_score=education_score,
                project_score=project_score,
                professional_presence_score=scores.get("professional_presence_score", 0),
                matched_skills_count=len(matched_skills),
                missing_skills_count=len(missing_skills),
                final_status=cand_status,
                rejection_reason=(
                    f"Score {overall_match_score:.1f} below threshold {SHORTLIST_THRESHOLD}"
                    if cand_status == "Rejected" else None
                ),
            )

            analysis = AnalysisResult(
                resume_id=resume.id,
                target_role_id=role.id if role else None,
                target_jd_id=jd.id if jd else None,
                readiness_score=scores["readiness_score"],
                skill_score=scores.get("skill_score", 0),
                project_score=project_score,
                professional_presence_score=scores.get("professional_presence_score", 0),
                overall_match_score=overall_match_score,
                experience_score=experience_score,
                education_score=education_score,
                
                # ATS sub-scores (all stored as real 0-100 values from score_engine v4)
                required_skills_score=scores.get("required_skills_score", 0),
                preferred_skills_score=scores.get("preferred_skills_score", 0),
                responsibility_match_score=scores.get("responsibility_match_score", 0),
                certification_score=scores.get("certification_score", 0),
                location_score=scores.get("location_score", 0),
                semantic_score=scores.get("semantic_score", 0),
                ats_formatting_score=scores.get("ats_formatting_score", 0),
                final_ats_score=scores.get("final_ats_score", 0),
                
                status=cand_status,
                strengths=recs.get("strengths", []),
                weaknesses=recs.get("weaknesses", []),
                recommendation_summary=recs.get("summary", ""),
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                extracted_skills=extracted_skills,
                soft_skills=soft_skills,
                learning_plan=recs.get("learning_plan", []),
                quick_wins=recs.get("quick_wins", []),
            )
            db.add(analysis)
            resume.upload_status = UploadStatus.analyzed
            
            
            if sp:
                metrics_result = await db.execute(
                    select(StudentDashboardMetrics).where(StudentDashboardMetrics.student_id == sp.id)
                )
                metrics = metrics_result.scalar_one_or_none()
                if metrics:
                    metrics.total_resumes_uploaded = metrics.total_resumes_uploaded + 1
                    metrics.latest_score = scores["readiness_score"]
                    if metrics.average_score is not None:
                        metrics.average_score = round(
                            (float(metrics.average_score) + scores["readiness_score"]) / 2, 2
                        )
                    else:
                        metrics.average_score = scores["readiness_score"]
                    if matched_skills:
                        metrics.strongest_skill = matched_skills[0]
                    if missing_skills:
                        metrics.weakest_skill = missing_skills[0]
                else:
                    metrics = StudentDashboardMetrics(
                        student_id=sp.id,
                        total_resumes_uploaded=1,
                        latest_score=scores["readiness_score"],
                        average_score=scores["readiness_score"],
                        strongest_skill=matched_skills[0] if matched_skills else None,
                        weakest_skill=missing_skills[0] if missing_skills else None,
                    )
                    db.add(metrics)
            
            await db.commit()
            await db.refresh(analysis)

            response_payload = {
                "id":                          str(analysis.id),
                "resume_id":                   str(analysis.resume_id),
                "target_role_id":              str(analysis.target_role_id) if analysis.target_role_id else None,
                "target_jd_id":                str(analysis.target_jd_id) if analysis.target_jd_id else None,
                "readiness_score":             float(analysis.readiness_score),
                "skill_score":                 float(analysis.skill_score),
                "project_score":               float(analysis.project_score),
                "professional_presence_score": float(analysis.professional_presence_score),
                "overall_match_score":         float(analysis.overall_match_score),
                "education_score":             float(analysis.education_score),
                "experience_score":            float(analysis.experience_score),
                "status":                      analysis.status,
                "strengths":                   analysis.strengths,
                "weaknesses":                  analysis.weaknesses,
                "recommendation_summary":      analysis.recommendation_summary,
                "matched_skills":  matched_skills,
                "missing_skills":  missing_skills,
                "extracted_skills": extracted_skills,
                "soft_skills":     soft_skills,
                "learning_plan":   recs.get("learning_plan", []),
                "quick_wins":      recs.get("quick_wins", []),
                "education":       parsed_data.education_summary if parsed_data else "",
                "experience":      parsed_data.experience_summary if parsed_data else "",
                # Legacy score_breakdown (backward compat)
                "score_breakdown": {
                    "required_skills_score":  float(analysis.required_skills_score or 0),
                    "preferred_skills_score": float(analysis.preferred_skills_score or 0),
                    "experience_score":        float(analysis.experience_score or 0),
                    "responsibility_score":    float(analysis.responsibility_match_score or 0),
                    "education_score_pct":     float(analysis.education_score or 0),
                    "certification_score":     float(analysis.certification_score or 0),
                    "ats_formatting_score":    float(getattr(analysis, 'ats_formatting_score', 0) or 0),
                },
                # New spec detailed breakdown — matches exact formula keys
                "detailed_breakdown": {
                    "requiredSkills":   float(analysis.required_skills_score or 0),
                    "preferredSkills":  float(analysis.preferred_skills_score or 0),
                    "responsibilities": float(analysis.responsibility_match_score or 0),
                    "experience":       float(analysis.experience_score or 0),
                    "education":        float(analysis.education_score or 0),
                    "certifications":   float(analysis.certification_score or 0),
                    "atsFormatting":    float(getattr(analysis, 'ats_formatting_score', 0) or 0),
                    "overall":          float(analysis.overall_match_score or 0),
                    "deductions":       scores.get("deductions", []),
                },
                "final_ats_score": float(analysis.final_ats_score or 0),
                "semantic_matches": semantic_matches,
                "extra_skills": extra_skills,
                "candidate_name": candidate_name,
            }
            update_job_status(job_id, "Completed", response_payload)
            
            from app.core.audit import log_audit_event
            log_audit_event("ANALYSIS_COMPLETED", current_user_id, str(analysis.id))
            
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        update_job_status(job_id, "Failed", {"error": str(e)})


@router.post("/{resume_id}/analyze")
async def queue_analyze_resume(
    resume_id: str,
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),   # ← was get_current_student; recruiters need access too
    db: AsyncSession = Depends(get_db),
):
    """
    Queue the AI analysis pipeline for a given resume against a target role.
    Accessible by any authenticated user; students may only analyze their own resumes.
    Recruiters and admins can analyze any resume.
    Returns a Job ID immediately.
    """
    from app.models.user import UserRole

    # Fetch resume
    res_result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = res_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Students may only analyze resumes they own
    if current_user.role == UserRole.student:
        sp_result = await db.execute(
            select(StudentProfile).where(StudentProfile.id == resume.student_profile_id)
        )
        sp = sp_result.scalar_one_or_none()
        if not sp or sp.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorised to analyse this resume.")
    # Recruiters and admins can analyze any resume — no ownership check needed

    # Require at least one targeting parameter
    if not request.target_role_id and not request.target_jd_id:
        raise HTTPException(
            status_code=422,
            detail="Provide either target_role_id or target_jd_id to run analysis."
        )

    import uuid
    job_id = str(uuid.uuid4())
    update_job_status(job_id, "Pending")

    background_tasks.add_task(
        analyze_resume_task,
        resume_id=resume_id,
        target_role_id=request.target_role_id,
        target_jd_id=request.target_jd_id,
        gemini_api_key=request.gemini_api_key,
        current_user_id=str(current_user.id),
        job_id=job_id
    )

    return {"job_id": job_id, "status": "Pending", "message": "Analysis queued successfully"}


# ---------------------------------------------------------------------------
# POST /api/resumes/bulk-analyze
# ---------------------------------------------------------------------------
@router.post("/bulk-analyze", response_model=List[BulkAnalysisResponse])
async def bulk_analyze_resumes(
    files: List[UploadFile] = File(...),
    roles: str = Form(""),
    skills: str = Form(""),
    jobDesc: str = Form(""),
    # Full JD criteria fields — populated when a JD is selected from JD Studio
    jd_id: str = Form(""),
    required_skills: str = Form(""),
    desired_skills: str = Form(""),
    certifications: str = Form(""),
    min_years: float = Form(0),
    max_years: float = Form(20),
    location_filter: str = Form(""),
    education_tier: str = Form("any"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk process multiple uploaded resumes against requested roles/skills/JD.
    Returns the leaderboard list expected by OrgDashboard.
    """
    from app.models.jd import JobDescription as JDModel

    # ── JD metadata fetched from DB (when jd_id is provided) ──────────────────
    jd_obj = None
    jd_location: str = ""
    jd_education: str = ""
    jd_certifications: list[str] = []
    jd_ai_threshold: int = 75

    if jd_id and jd_id.strip():
        jd_result = await db.execute(
            select(JDModel).where(JDModel.id == jd_id.strip())
        )
        jd_obj = jd_result.scalar_one_or_none()
        if jd_obj:
            jd_location = jd_obj.location or ""
            jd_education = jd_obj.education or ""
            jd_certifications = jd_obj.certifications or []
            jd_ai_threshold = int(jd_obj.ai_matching_threshold or 75)
            logger.info(
                "[BULK ANALYZE] JD fetched from DB",
                jd_id=jd_id,
                jd_title=jd_obj.title,
                jd_location=jd_location,
                jd_education=jd_education,
                jd_certifications=jd_certifications,
            )
        else:
            logger.warning("[BULK ANALYZE] jd_id provided but JD not found in DB", jd_id=jd_id)

    # ── Merge location / education from form if not in JD ─────────────────────
    effective_location = location_filter.strip() or jd_location
    effective_education = education_tier.strip() if education_tier.strip() != "any" else ""
    if not effective_education and jd_education:
        effective_education = jd_education

    # ── Parse certifications from form and merge with JD ──────────────────────
    form_certifications = [c.strip() for c in certifications.split(",") if c.strip()]
    effective_certifications = list(set(form_certifications + jd_certifications))
    normalized_certifications = normalize_skill_list(effective_certifications)

    # ── 1. Compile required skills from all sources ────────────────────────────
    combined_required_skills: set[str] = set()

    # 1a. Explicit skills from `required_skills` form field (from JD skills chips)
    if required_skills:
        for s in required_skills.split(","):
            s = s.strip()
            if s:
                combined_required_skills.add(s)

    # 1b. Additional skills from legacy `skills` field
    # Only use legacy `skills` field if `required_skills` is not provided
    if skills and required_skills is None:
        for s in skills.split(","):
            s = s.strip()
            if s:
                combined_required_skills.add(s)

    # 1c. Skills mapped to named roles from the database
    if roles:
        role_list = [r.strip() for r in roles.split(",") if r.strip()]
        if role_list:
            from app.models.role_skill import RoleSkill
            from app.models.skill import Skill
            rs_result = await db.execute(
                select(Skill.skill_name)
                .join(RoleSkill, RoleSkill.skill_id == Skill.id)
                .join(CareerRole, CareerRole.id == RoleSkill.role_id)
                .where(CareerRole.role_name.in_(role_list))
            )
            for row in rs_result.all():
                combined_required_skills.add(row[0])

    # 1d. Skills from JD object fetched from DB
    if jd_obj:
        for s in (jd_obj.skills or []):
            combined_required_skills.add(s)

    # 1e. Extract skills from free-text Job Description ONLY if no other explicit skills provided
    if jobDesc and jobDesc.strip() and not combined_required_skills:
        jd_extracted = await extract_skills_from_jd_text(jobDesc.strip())
        combined_required_skills.update(jd_extracted)
        logger.info(
            "[BULK ANALYZE] Extracted skills from JD text as fallback",
            jd_skills=jd_extracted,
            jd_char_count=len(jobDesc),
        )

    # 1f. Desired/preferred skills (weighted lower — added but tracked separately)
    desired_skills_list: list[str] = []
    if desired_skills:
        for s in desired_skills.split(","):
            s = s.strip()
            if s:
                desired_skills_list.append(s)
    if jd_obj:
        for s in (jd_obj.preferred_skills or []):
            desired_skills_list.append(s)
    desired_skills_list = list(set(desired_skills_list))

    # 1g. Normalize all required skills to canonical forms
    required_skills_list = normalize_skill_list(list(combined_required_skills))

    # NOTE: We intentionally do NOT inject a generic fallback skill list.
    # If no skills/roles/JD are given, scoring will be based purely on
    # resume quality (experience, education, projects, presence).

    logger.info(
        "[BULK ANALYZE] Required skills compiled",
        jd_id=jd_id or None,
        from_explicit_skills=bool(required_skills or skills),
        from_roles=bool(roles),
        from_jd_db=bool(jd_obj),
        from_jd_text=bool(jobDesc),
        desired_skills_count=len(desired_skills_list),
        certifications_count=len(normalized_certifications),
        total_required_skills=len(required_skills_list),
        required_skills=required_skills_list,
        min_years=min_years,
        max_years=max_years,
        location_filter=effective_location,
        education_tier=effective_education,
    )

    results = []

    # 2. Process each file concurrently for AI extraction
    async def process_single_resume(file):
        safe_filename = clean_filename(file.filename)
        if not safe_filename.lower().endswith((".pdf", ".doc", ".docx")):
            return None

        content = await file.read()
        error_msg = ""
        try:
            text = await extract_text_from_document(content, safe_filename)
        except Exception as exc:
            logger.warning(
                "[BULK ANALYZE] Text extraction failed — skipping file",
                filename=safe_filename,
                error=str(exc),
            )
            text = ""
            error_msg = str(exc)

        if not text or not text.strip():
            logger.warning(
                "[BULK ANALYZE] Empty text after extraction — adding error entry",
                filename=safe_filename,
            )
            msg = "OCR/Extraction Failed. If this is a scanned PDF, please install Tesseract OCR."
            if "Tesseract" in error_msg:
                msg = "Tesseract OCR is required for this scanned PDF but is not installed."
            return {"error": True, "msg": msg, "safe_filename": safe_filename}

        # Run AI Pipeline
        extracted_skills = await extract_skills(text)
        gap = await perform_gap_analysis(extracted_skills, required_skills_list, resume_text=text)
        comp = await evaluate_completeness(text)
        
        parsed_data = parse_resume_text(text)
        clean_name = extract_candidate_name(text, fallback_filename=safe_filename)

        candidate_location = parsed_data.get("location") or parsed_data.get("address") or ""
        candidate_education = parsed_data.get("education") or ""
        candidate_email = parsed_data.get("email") or ""
        candidate_phone = parsed_data.get("phone") or ""
        
        candidate_certs_raw = parsed_data.get("certifications") or []
        if isinstance(candidate_certs_raw, str):
            candidate_certs = [c.strip() for c in candidate_certs_raw.split(",") if c.strip()]
        elif isinstance(candidate_certs_raw, list):
            candidate_certs = candidate_certs_raw
        else:
            candidate_certs = []
            
        if jd_obj:
            scores = await calculate_ats_score(
                resume_text=text,
                required_skills=required_skills_list,
                preferred_skills=desired_skills_list,
                matched_skills=gap["matched_skills"],
                missing_skills=gap["missing_skills"],
                jd_description=jd_obj.description or "",
                jd_requirements=jd_obj.requirements or "",
                jd_experience_level=jd_obj.experience_level or "",
                jd_education=jd_obj.education or "",
                jd_certifications=jd_obj.certifications or [],
                experience_bullets=extract_experience_bullets(text),
                years_experience=extract_years_of_experience(text),
                candidate_certifications=candidate_certs,
                semantic_matches=gap.get("semantic_matches", {}),
                jd_location=jd_obj.location or "",
                candidate_location=candidate_location
            )
            overall = scores["final_ats_score"]
            sel_thresh = int(jd_obj.selected_threshold) if jd_obj.selected_threshold else 80
            wait_thresh = int(jd_obj.waiting_threshold) if jd_obj.waiting_threshold else 75
            status = get_status_from_thresholds(overall, sel_thresh, wait_thresh)
        else:
            scores = await calculate_readiness_score(text, gap["matched_skills"], required_skills_list)
            overall = scores["readiness_score"]
            status = get_status_from_score(overall, SHORTLIST_THRESHOLD)

        experience = scores.get("experience_score", 0)
        if not jd_obj:
            experience = min(experience * 5.0, 100.0)

        ats = float(comp["completeness_score"])
        gap_match_rate = float(gap.get("match_rate", 0))
        raw_skill_score = float(scores.get("skill_score", scores.get("required_skills_score", 0)))
        
        if not jd_obj:
            skill_match_pct = min(raw_skill_score / 50.0 * 100.0, 100.0)
        else:
            skill_match_pct = round(raw_skill_score, 2)

        adjusted_overall = max(0.0, min(100.0, overall))

        if jd_obj:
            sel_thresh = int(jd_obj.selected_threshold) if jd_obj.selected_threshold else 80
            wait_thresh = int(jd_obj.waiting_threshold) if jd_obj.waiting_threshold else 75
            adjusted_status = get_status_from_thresholds(adjusted_overall, sel_thresh, wait_thresh)
        else:
            adjusted_status = get_status_from_score(adjusted_overall, SHORTLIST_THRESHOLD)

        if adjusted_status != "Shortlisted":
            if adjusted_overall > 60:
                adjusted_status = "Borderline"
            else:
                adjusted_status = "Rejected"

        return {
            "error": False,
            "safe_filename": safe_filename,
            "content": content,
            "text": text,
            "clean_name": clean_name,
            "extracted_skills": extracted_skills,
            "gap": gap,
            "scores": scores,
            "candidate_location": candidate_location,
            "candidate_education": candidate_education,
            "candidate_email": candidate_email,
            "candidate_phone": candidate_phone,
            "candidate_certs": candidate_certs,
            "experience": experience,
            "ats": ats,
            "gap_match_rate": gap_match_rate,
            "raw_skill_score": raw_skill_score,
            "skill_match_pct": skill_match_pct,
            "adjusted_overall": adjusted_overall,
            "adjusted_status": adjusted_status,
        }

    import asyncio
    ai_results = await asyncio.gather(*[process_single_resume(f) for f in files])

    # 3. Process DB sequential operations
    import time
    from app.models.pipeline_entry import PipelineEntry
    from app.models.analysis_result import AnalysisResult

    for res in ai_results:
        if not res:
            continue
            
        if res.get("error"):
            msg = res["msg"]
            results.append(BulkAnalysisResponse(
                name=f"{res['safe_filename']} (ERROR)",
                overall=0.0,
                skillMatch=0.0,
                experience=0.0,
                ats=0.0,
                status="Rejected",
                missing=[msg],
                matched=[],
                score_breakdown={
                    "required_skills_score": 0.0,
                    "preferred_skills_score": 0.0,
                    "experience_score": 0.0,
                    "responsibility_score": 0.0,
                    "education_score_pct": 0.0,
                    "certification_score": 0.0,
                    "location_score": 0.0,
                    "semantic_score": 0.0,
                }
            ))
            continue

        safe_filename = res["safe_filename"]
        content = res["content"]
        text = res["text"]
        clean_name = res["clean_name"]
        extracted_skills = res["extracted_skills"]
        gap = res["gap"]
        scores = res["scores"]
        candidate_location = res["candidate_location"]
        candidate_education = res["candidate_education"]
        candidate_email = res["candidate_email"]
        candidate_phone = res["candidate_phone"]
        candidate_certs = res["candidate_certs"]
        experience = res["experience"]
        ats = res["ats"]
        gap_match_rate = res["gap_match_rate"]
        raw_skill_score = res["raw_skill_score"]
        skill_match_pct = res["skill_match_pct"]
        adjusted_overall = res["adjusted_overall"]
        adjusted_status = res["adjusted_status"]

        timestamp = int(time.time())
        uid = getattr(current_user, "id", "unknown")
        file_location = os.path.join(settings.UPLOAD_DIR, f"{uid}_{timestamp}_{safe_filename}")
        with open(file_location, "wb") as fobj:
            fobj.write(content)
            
        file_size = os.path.getsize(file_location)
        ext = safe_filename.lower().rsplit(".", 1)[-1]
        mime_map = {
            "pdf": "application/pdf",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
        file_type = mime_map.get(ext, "application/octet-stream")

        resume_obj = Resume(
            uploader_id=uid,
            original_filename=safe_filename,
            file_path=file_location,
            file_size=file_size,
            file_type=file_type,
            upload_status=UploadStatus.analyzed,
            is_active=True,
        )
        db.add(resume_obj)
        await db.flush()

        parsed_obj = ResumeParsedData(
            resume_id=resume_obj.id,
            extracted_text=text,
            extracted_name=clean_name,
            extracted_email=candidate_email,
            extracted_phone=candidate_phone,
            education_summary=candidate_education,
            certifications_summary=", ".join(candidate_certs),
        )
        db.add(parsed_obj)
        
        if adjusted_status == "Shortlisted":
            pipeline_stage = "screening"
        elif adjusted_status == "Rejected":
            pipeline_stage = "rejected"
        else:
            pipeline_stage = "new"

        pe_obj = PipelineEntry(resume_id=resume_obj.id, stage=pipeline_stage)
        db.add(pe_obj)

        ar_obj = AnalysisResult(
            resume_id=resume_obj.id,
            target_jd_id=jd_obj.id if jd_obj else None,
            readiness_score=adjusted_overall,
            overall_match_score=adjusted_overall,
            skill_score=raw_skill_score,
            required_skills_score=float(scores.get("required_skills_score", 0)),
            preferred_skills_score=float(scores.get("preferred_skills_score", 0)),
            experience_score=scores.get("experience_score", 0),
            responsibility_match_score=float(scores.get("responsibility_match_score", 0)),
            education_score=scores.get("education_score", 0),
            certification_score=float(scores.get("certification_score", 0)),
            location_score=float(scores.get("location_score", 0)),
            semantic_score=float(scores.get("semantic_score", 0)),
            final_ats_score=float(scores.get("final_ats_score", 0)),
            project_score=scores.get("project_score", 0),
            professional_presence_score=scores.get("professional_presence_score", 0),
            matched_skills=gap["matched_skills"],
            missing_skills=gap["missing_skills"],
            status=adjusted_status,
            selection_status=(
                "✅ Selected" if adjusted_status == "Shortlisted"
                else "❌ Not Selected" if adjusted_status == "Rejected"
                else "⏳ Waiting"
            ),
        )
        db.add(ar_obj)

        results.append(BulkAnalysisResponse(
            name=clean_name,
            overall=adjusted_overall,
            skillMatch=skill_match_pct,
            experience=experience,
            ats=adjusted_overall,
            status=adjusted_status,
            missing=gap["missing_skills"],
            matched=gap["matched_skills"],
            location=candidate_location or None,
            education=candidate_education or None,
            email=candidate_email or None,
            phone=candidate_phone or None,
            certifications=candidate_certs if candidate_certs else None,
            required_skills_score=scores.get("required_skills_score", 0),
            preferred_skills_score=scores.get("preferred_skills_score", 0),
            experience_score_pct=scores.get("experience_score", 0),
            responsibility_score=scores.get("responsibility_match_score", 0),
            education_score_pct=scores.get("education_score", 0),
            certification_score=scores.get("certification_score", 0),
            location_score=scores.get("location_score", 0),
            semantic_score=scores.get("semantic_score", 0),
            final_ats_score=scores.get("final_ats_score", 0),
            score_breakdown={
                "required_skills_score": float(scores.get("required_skills_score", 0)),
                "preferred_skills_score": float(scores.get("preferred_skills_score", 0)),
                "experience_score": float(scores.get("experience_score", 0)),
                "responsibility_score": float(scores.get("responsibility_match_score", 0)),
                "education_score_pct": float(scores.get("education_score", 0)),
                "certification_score": float(scores.get("certification_score", 0)),
                "location_score": float(scores.get("location_score", 0)),
                "semantic_score": float(scores.get("semantic_score", 0)),
            },
            extra_skills=gap.get("extra_skills", []),
            semantic_matches=gap.get("semantic_matches", {}),
            debug_info={
                "extracted_skills": extracted_skills,
                "jd_skills": required_skills_list,
                "jd_preferred_skills": desired_skills_list,
                "matched_skills": gap["matched_skills"],
                "missing_skills": gap["missing_skills"],
                "experience_years_found": extract_years_of_experience(text),
                "certifications_found": candidate_certs,
                "scores_raw": scores,
            }
        ))

    await db.commit()

    results.sort(key=lambda x: x.overall, reverse=True)
    
    total_candidates = len(results)
    for idx, res in enumerate(results):
        res.ai_rank = idx + 1
        res.percentile = round(((total_candidates - res.ai_rank) / total_candidates) * 100, 2) if total_candidates > 0 else 0.0
        if res.status in ("Selected", "Shortlisted"):
            res.selection_status = "✅ Selected"
        elif res.status in ("Waitlist", "Borderline"):
            res.selection_status = "⏳ Waiting"
        else:
            res.selection_status = "❌ Not Selected"

    return results
