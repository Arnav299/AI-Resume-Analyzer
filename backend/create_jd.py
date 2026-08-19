import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_maker
from app.models.jd import JobDescription
from app.models.user import User
from sqlalchemy import select

async def main():
    async with async_session_maker() as session:
        # Get the first admin or recruiter user to attach the JD to
        result = await session.execute(select(User).where(User.role.in_(["admin", "recruiter"])))
        user = result.scalars().first()
        user_id = user.id if user else None

        jd = JobDescription(
            user_id=user_id,
            title="Senior Software Engineer",
            company="TechNova Solutions", # Or leave generic, but the resume had TechNova Solutions as past experience. "Job Description based on the provided resume" means we are creating a JD for a candidate like this to apply to.
            domain="Software Engineering",
            department="Engineering",
            location="Bengaluru, India",
            employment_type="Full-time",
            work_mode="Hybrid",
            salary="Not Specified",
            experience_level="6+ years",
            education="B.Tech. in Computer Science & Engineering or equivalent",
            description="We are seeking an experienced and highly skilled Senior Software Engineer to join our core engineering team. You will be responsible for designing, developing, and optimizing enterprise web applications and robust APIs. As a senior member of the team, you will drive technical decisions, improve database performance, and mentor junior developers. The ideal candidate has a strong background in full-stack development, cloud infrastructure, and a passion for building scalable solutions.",
            requirements="- 6+ years of professional software engineering experience.\n- Proven expertise in enterprise web application development.\n- Strong experience with API optimization and database performance tuning.\n- Hands-on experience with CI/CD pipelines.\n- Excellent problem-solving skills and the ability to mentor junior developers.",
            benefits="- Competitive salary and performance bonuses.\n- Comprehensive health insurance.\n- Flexible work hours and remote work options.\n- Opportunities for professional growth and certifications.",
            skills=["Java", "Spring Boot", "Python", "JavaScript", "React", "Node.js", "SQL", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Git"],
            preferred_skills=["AWS Certified Developer", "Oracle Certified Java Programmer", "Microsoft Azure Fundamentals"],
            certifications=["AWS Certified Developer", "Oracle Certified Java Programmer", "Microsoft Azure Fundamentals"],
            status="Active"
        )
        
        session.add(jd)
        await session.commit()
        print(f"Created JD: {jd.title} with ID {jd.id}")

if __name__ == "__main__":
    asyncio.run(main())
