import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.jd import JobDescription

async def add_jds():
    async with AsyncSessionLocal() as db:
        # Get the first org or recruiter user
        result = await db.execute(select(User).where(User.role.in_(["organization", "recruiter", "admin"])))
        user = result.scalars().first()
        if not user:
            print("No org/recruiter/admin user found!")
            return

        jds_data = [
            {
                "title": "Machine Learning Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "AI/ML",
                "location": "Various",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "Not Specified",
                "experience_level": "2-5 years",
                "education": "Bachelor's or Master's in CS or related field",
                "description": "We are looking for a Machine Learning Engineer to join our team and build scalable ML models.",
                "requirements": "Develop and deploy machine learning models. Collaborate with cross-functional teams.",
                "benefits": "Competitive salary, health insurance, flexible hours.",
                "skills": ["Python", "Scikit-learn", "TensorFlow/PyTorch", "Pandas", "NumPy", "SQL", "Machine Learning", "Data Preprocessing"],
                "preferred_skills": ["NLP", "Computer Vision", "MLOps", "FastAPI", "Docker"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Senior React Developer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Frontend",
                "location": "Various",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "Not Specified",
                "experience_level": "4-7 years",
                "education": "Bachelor's in CS or related field",
                "description": "Seeking an experienced Senior React Developer to lead frontend architecture and development.",
                "requirements": "Design and implement scalable web applications using modern frontend technologies.",
                "benefits": "Competitive salary, health insurance, flexible hours.",
                "skills": ["React.js", "TypeScript", "JavaScript", "HTML", "CSS", "REST APIs", "Git"],
                "preferred_skills": ["Next.js", "Redux", "GraphQL", "Jest", "AWS"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Senior Backend Systems Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Backend",
                "location": "Various",
                "employment_type": "Full-time",
                "work_mode": "Remote",
                "salary": "Not Specified",
                "experience_level": "5-8 years",
                "education": "Bachelor's in CS or related field",
                "description": "We are looking for a Senior Backend Systems Engineer to architect and build robust backend services.",
                "requirements": "Develop scalable backend systems, APIs, and microservices.",
                "benefits": "Competitive salary, health insurance, flexible hours.",
                "skills": ["Python", "Go", "PostgreSQL", "REST APIs", "Docker", "Kubernetes", "Redis"],
                "preferred_skills": ["Kafka", "gRPC", "Elasticsearch", "AWS", "Microservices"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Machine Learning Engineer – NLP",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "AI/ML",
                "location": "Various",
                "employment_type": "Full-time",
                "work_mode": "On-site",
                "salary": "Not Specified",
                "experience_level": "2-5 years",
                "education": "Bachelor's or Master's in CS or related field",
                "description": "Join our AI team to specialize in Natural Language Processing and build LLM-driven applications.",
                "requirements": "Develop NLP models, fine-tune LLMs, and integrate them into production systems.",
                "benefits": "Competitive salary, health insurance, flexible hours.",
                "skills": ["Python", "NLP", "PyTorch", "Transformers", "Hugging Face", "SQL", "Machine Learning"],
                "preferred_skills": ["LLMs", "LangChain", "RAG", "FastAPI", "MLOps"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Senior Software Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Software",
                "location": "Various",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "Not Specified",
                "experience_level": "5-8 years",
                "education": "Bachelor's in CS or related field",
                "description": "Seeking a Senior Software Engineer to design and implement complex software systems.",
                "requirements": "Write clean, maintainable code, design system architecture, and mentor junior engineers.",
                "benefits": "Competitive salary, health insurance, flexible hours.",
                "skills": ["Java", "Python", "REST APIs", "SQL", "Git", "Data Structures & Algorithms", "Software Design"],
                "preferred_skills": ["AWS", "Docker", "Kubernetes", "Microservices", "System Design"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            }
        ]

        for data in jds_data:
            jd = JobDescription(user_id=user.id, **data)
            db.add(jd)
        
        await db.commit()
        print("Added 5 new Job Descriptions successfully!")

if __name__ == "__main__":
    asyncio.run(add_jds())
