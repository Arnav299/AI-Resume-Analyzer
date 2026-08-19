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
        result = await db.execute(select(User).where(User.role.in_(["organization", "recruiter"])))
        user = result.scalars().first()
        if not user:
            print("No org/recruiter user found!")
            return

        jds_data = [
            {
                "title": "Machine Learning Engineer",
                "company": "Innovant",
                "domain": "Data Science",
                "department": "Engineering",
                "location": "San Francisco, CA",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$130k - $160k",
                "experience_level": "Mid-Level",
                "education": "Master's in CS or related field",
                "description": "Join our AI team to build and scale machine learning models.",
                "requirements": "Develop NLP and computer vision models, deploy to AWS.",
                "benefits": "Competitive equity, health insurance, flexible hours.",
                "skills": ["Python", "TensorFlow", "PyTorch", "SQL"],
                "preferred_skills": ["Docker", "AWS", "MLflow"],
                "certifications": ["AWS Machine Learning Specialty"],
                "ai_matching_threshold": 80,
                "selected_threshold": 90,
                "waiting_threshold": 75,
                "status": "Active"
            },
            {
                "title": "Frontend Developer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Product",
                "location": "Austin, TX",
                "employment_type": "Full-time",
                "work_mode": "Remote",
                "salary": "$100k - $120k",
                "experience_level": "Mid-Level",
                "education": "Bachelor's in CS or equivalent",
                "description": "We are looking for an experienced frontend developer to craft beautiful UIs.",
                "requirements": "Build responsive web applications using React and Tailwind CSS.",
                "benefits": "Unlimited PTO, remote work stipend.",
                "skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS"],
                "preferred_skills": ["Next.js", "Redux", "Figma"],
                "certifications": [],
                "ai_matching_threshold": 75,
                "selected_threshold": 85,
                "waiting_threshold": 70,
                "status": "Active"
            },
            {
                "title": "Backend Software Engineer",
                "company": "Innovant",
                "domain": "Engineering",
                "department": "Infrastructure",
                "location": "New York, NY",
                "employment_type": "Full-time",
                "work_mode": "On-site",
                "salary": "$120k - $150k",
                "experience_level": "Senior",
                "education": "Bachelor's in CS",
                "description": "Design and maintain high-performance microservices.",
                "requirements": "Build RESTful APIs and manage database scalability.",
                "benefits": "401k match, free lunches, gym membership.",
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                "preferred_skills": ["Kubernetes", "Redis", "Kafka"],
                "certifications": ["AWS Certified Solutions Architect"],
                "ai_matching_threshold": 75,
                "selected_threshold": 90,
                "waiting_threshold": 80,
                "status": "Active"
            },
            {
                "title": "Product Manager",
                "company": "Innovant",
                "domain": "Product",
                "department": "Management",
                "location": "Seattle, WA",
                "employment_type": "Full-time",
                "work_mode": "Hybrid",
                "salary": "$140k - $170k",
                "experience_level": "Senior",
                "education": "MBA or Bachelor's in Business/CS",
                "description": "Lead the product vision and work closely with engineering and design.",
                "requirements": "Define product roadmap, gather user feedback, and manage sprints.",
                "benefits": "Stock options, comprehensive health coverage.",
                "skills": ["Agile", "Scrum", "Jira", "Product Strategy"],
                "preferred_skills": ["Data Analysis", "UX Principles"],
                "certifications": ["Certified Scrum Product Owner (CSPO)"],
                "ai_matching_threshold": 70,
                "selected_threshold": 85,
                "waiting_threshold": 75,
                "status": "Active"
            }
        ]

        for data in jds_data:
            jd = JobDescription(user_id=user.id, **data)
            db.add(jd)
        
        await db.commit()
        print("Added 4 new Job Descriptions successfully!")

if __name__ == "__main__":
    asyncio.run(add_jds())
