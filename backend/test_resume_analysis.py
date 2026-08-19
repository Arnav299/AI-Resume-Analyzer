import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.recommendation_engine import generate_recommendations
from app.services.gap_analysis import perform_gap_analysis
from app.routers.resumes import analyze_resume_task


@pytest.mark.asyncio
async def test_dynamic_fallback_recommendations():
    """
    Tests that the fallback recommendation engine dynamically scores
    and identifies gaps based on the actual extracted skills,
    resulting in different scores for different resumes/roles.
    """
    # Resume 1: Data Scientist Focus
    data_skills = ["python", "pandas", "sql", "machine learning"]

    # Resume 2: Frontend Developer Focus
    frontend_skills = ["javascript", "react", "html", "css"]

    # Analyze Resume 1 for Data Role
    recs_data_for_data = await generate_recommendations(
        missing_skills=[],  # Empty because required_skills is empty in DB
        matched_skills=[],
        readiness_score=0,
        resume_text="I am a data scientist...",
        target_role_name="Data Scientist",
        api_key=None,  # Trigger fallback
        extracted_skills=data_skills
    )

    # Analyze Resume 1 for Frontend Role
    recs_data_for_frontend = await generate_recommendations(
        missing_skills=[],
        matched_skills=[],
        readiness_score=0,
        resume_text="I am a data scientist...",
        target_role_name="Frontend Developer",
        api_key=None,
        extracted_skills=data_skills
    )

    # Assert that the same resume gets DIFFERENT readiness scores and matches for DIFFERENT roles
    assert recs_data_for_data["inferred_scores"]["readiness_score"] != recs_data_for_frontend["inferred_scores"]["readiness_score"]

    # Data role should heavily match the data skills
    assert len(recs_data_for_data["inferred_matched_skills"]) > len(recs_data_for_frontend["inferred_matched_skills"])


@pytest.mark.asyncio
@patch("app.routers.resumes.update_job_status")
@patch("app.core.database.AsyncSessionLocal")
async def test_analyze_resume_task_empty_text(mock_session, mock_update_job):
    """
    Tests that an empty resume text is safely rejected and the background
    task is failed gracefully with the correct error message.
    """
    mock_db = AsyncMock()
    mock_session.return_value.__aenter__.return_value = mock_db

    # Mock resume that exists but has no readable text
    mock_resume = MagicMock()
    mock_resume.id = "resume-123"
    mock_resume.file_path = "non_existent.pdf"
    mock_resume.original_filename = "test_resume.pdf"
    mock_resume.student_profile_id = None  # No student profile — skips profile block

    # Parsed data with only whitespace — triggers the empty-text guard
    mock_parsed = MagicMock()
    mock_parsed.extracted_text = "   "

    # Track execute call order:
    # Call 1 → Resume lookup
    # Call 2 → StudentProfile lookup (student_profile_id=None → sp=None, skips further profile queries)
    # Call 3+ → ResumeParsedData lookup
    call_count = [0]

    async def mock_execute(query, *args, **kwargs):
        call_count[0] += 1
        mock_result = MagicMock()
        if call_count[0] == 1:
            # Resume lookup
            mock_result.scalar_one_or_none.return_value = mock_resume
        elif call_count[0] == 2:
            # StudentProfile lookup — return None (no profile linked)
            mock_result.scalar_one_or_none.return_value = None
        else:
            # ResumeParsedData lookup
            mock_result.scalar_one_or_none.return_value = mock_parsed
        return mock_result

    mock_db.execute = mock_execute
    mock_db.commit = AsyncMock()

    await analyze_resume_task(
        resume_id="resume-123",
        target_role_id="role-123",
        target_jd_id=None,
        gemini_api_key="",
        current_user_id="user-123",
        job_id="job-123"
    )

    # Verify the job was marked Failed due to empty text
    mock_update_job.assert_any_call(
        "job-123",
        "Failed",
        {"error": "Could not extract text from resume. Please ensure the file is a readable PDF/DOCX."}
    )
