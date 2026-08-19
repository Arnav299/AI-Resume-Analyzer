import sys
import os

filepath = r'c:\Users\TANUJA SOPAN SHELKE\OneDrive\Desktop\Antigrvaity\AI_Resume_Analyzer\backend\app\routers\resumes.py'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

# Find the start of the loop
for i, line in enumerate(lines):
    if line.startswith('    # 2. Process each file'):
        start_idx = i
    if line.startswith('    results.sort(key=lambda x: x.overall, reverse=True)'):
        end_idx = i
        break

if start_idx == -1 or end_idx == -1:
    print("Could not find bounds.")
    sys.exit(1)

new_code = """    # 2. Process each file concurrently for AI extraction
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

"""

new_lines = lines[:start_idx] + [new_code] + lines[end_idx:]
with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
