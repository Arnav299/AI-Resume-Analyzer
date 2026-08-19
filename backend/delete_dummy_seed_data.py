import asyncio
import os
import sys

# Add the parent directory to sys.path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.resume import Resume
from app.models.resume_parsed_data import ResumeParsedData
from app.models.analysis_result import AnalysisResult
from app.models.pipeline_entry import PipelineEntry
from app.models.interview_scorecard import InterviewScorecard
from app.models.jd import JobDescription
from sqlalchemy import select, delete

DUMMY_EMAILS = [
    "priya@example.com",
    "rahul@example.com",
    "ananya@example.com",
    "karan@example.com",
    "sneha@example.com"
]

DUMMY_JD_TITLES = [
    "Senior React Developer",
    "Cybersecurity Analyst",
    "Senior UI/UX Designer",
    "Data Engineer",
    "React Native Developer",
    "Cloud Solutions Architect",
    "Business Analyst – FinTech",
    "QA Automation Engineer",
    "Growth Marketing Manager",
    "Blockchain Developer",
    "HR Business Partner – Tech",
    "Site Reliability Engineer (SRE)",
    "Technical Content Writer",
    "Finance Analyst – FP&A",
    "Computer Vision Engineer",
    "Enterprise Sales Executive"
]

async def delete_dummy_data():
    async with AsyncSessionLocal() as db:
        print("Starting deletion of dummy data...")

        # 1. Delete dummy Job Descriptions
        result = await db.execute(select(JobDescription).where(JobDescription.title.in_(DUMMY_JD_TITLES)))
        jds = result.scalars().all()
        for jd in jds:
            await db.delete(jd)
        print(f"Deleted {len(jds)} dummy Job Descriptions.")

        # 2. Find dummy users
        result = await db.execute(select(User).where(User.email.in_(DUMMY_EMAILS)))
        users = result.scalars().all()
        user_ids = [u.id for u in users]
        
        if not user_ids:
            print("No dummy users found.")
        else:
            # Find their student profiles
            result = await db.execute(select(StudentProfile).where(StudentProfile.user_id.in_(user_ids)))
            profiles = result.scalars().all()
            profile_ids = [p.id for p in profiles]

            if profile_ids:
                # Find their resumes
                result = await db.execute(select(Resume).where(Resume.student_profile_id.in_(profile_ids)))
                resumes = result.scalars().all()
                resume_ids = [r.id for r in resumes]

                if resume_ids:
                    # Delete dependencies of resumes
                    await db.execute(delete(PipelineEntry).where(PipelineEntry.resume_id.in_(resume_ids)))
                    await db.execute(delete(InterviewScorecard).where(InterviewScorecard.resume_id.in_(resume_ids)))
                    await db.execute(delete(ResumeParsedData).where(ResumeParsedData.resume_id.in_(resume_ids)))
                    
                    # Delete AnalysisResults and their dependencies
                    result = await db.execute(select(AnalysisResult).where(AnalysisResult.resume_id.in_(resume_ids)))
                    analyses = result.scalars().all()
                    analysis_ids = [a.id for a in analyses]
                    
                    if analysis_ids:
                        from app.models.skill_gap_analysis import SkillGapAnalysis
                        from app.models.career_recommendation import CareerRecommendation
                        from app.models.user_recommendation import UserRecommendation
                        from app.models.mentor_feedback import MentorFeedback
                        from app.models.ai_recommendation_log import AIRecommendationLog
                        from app.models.activity_log import ActivityLog
                        from app.models.resume_skill import ResumeSkill
                        
                        await db.execute(delete(SkillGapAnalysis).where(SkillGapAnalysis.analysis_result_id.in_(analysis_ids)))
                        await db.execute(delete(CareerRecommendation).where(CareerRecommendation.analysis_result_id.in_(analysis_ids)))
                        await db.execute(delete(UserRecommendation).where(UserRecommendation.analysis_result_id.in_(analysis_ids)))
                        await db.execute(delete(MentorFeedback).where(MentorFeedback.analysis_result_id.in_(analysis_ids)))
                        await db.execute(delete(AIRecommendationLog).where(AIRecommendationLog.analysis_result_id.in_(analysis_ids)))
                        await db.execute(delete(ActivityLog).where(ActivityLog.entity_name == 'AnalysisResult').where(ActivityLog.entity_id.in_(analysis_ids)))
                        await db.execute(delete(ResumeSkill).where(ResumeSkill.resume_id.in_(resume_ids)))

                    # Finally delete resumes
                    await db.execute(delete(Resume).where(Resume.id.in_(resume_ids)))
                    print(f"Deleted {len(resume_ids)} dummy resumes and their dependencies.")
            
            # Delete Activity logs for the users directly
            from app.models.activity_log import ActivityLog
            await db.execute(delete(ActivityLog).where(ActivityLog.user_id.in_(user_ids)))

            # Delete StudentDashboardMetrics
            from app.models.student_dashboard_metrics import StudentDashboardMetrics
            await db.execute(delete(StudentDashboardMetrics).where(StudentDashboardMetrics.student_id.in_(profile_ids)))

            # Delete the profiles and users
            await db.execute(delete(StudentProfile).where(StudentProfile.id.in_(profile_ids)))
            await db.execute(delete(User).where(User.id.in_(user_ids)))
            print(f"Deleted {len(users)} dummy users.")

        await db.commit()
        print("Finished deletion.")

if __name__ == "__main__":
    asyncio.run(delete_dummy_data())
