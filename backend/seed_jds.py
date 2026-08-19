#!/usr/bin/env python3
"""
Seed 5 Job Descriptions into the database for testing.
Run from: backend/ directory with:
  .\\venv\\Scripts\\python.exe seed_jds.py
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.jd import JobDescription
from sqlalchemy import select

JDS = [
    {
        "title": "Senior Data Scientist",
        "domain": "Data Science",
        "department": "Analytics",
        "location": "Bangalore, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Senior",
        "salary": "25-40 LPA",
        "education": "B.Tech/M.Tech in CS, Statistics, or related field",
        "skills": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Statistics", "Data Visualization"],
        "preferred_skills": ["MLOps", "Spark", "AWS SageMaker", "NLP"],
        "certifications": [],
        "description": "We are looking for a passionate Senior Data Scientist to join our AI team. You will lead data-driven projects, build predictive models, and collaborate with cross-functional teams to deliver business insights.",
        "requirements": "5+ years of experience in data science. Strong understanding of ML algorithms. Ability to translate business problems into data solutions.",
        "benefits": "Health insurance, stock options, flexible hours, remote work allowance, learning budget",
        "ai_matching_threshold": 75,
        "selected_threshold": 90,
        "waiting_threshold": 70,
        "status": "Active",
    },
    {
        "title": "Full Stack Developer (React + FastAPI)",
        "domain": "Software Engineering",
        "department": "Product Engineering",
        "location": "Mumbai, India",
        "employment_type": "Full-time",
        "work_mode": "Remote",
        "experience_level": "Mid-Level",
        "salary": "15-25 LPA",
        "education": "B.Tech in Computer Science or equivalent",
        "skills": ["React", "JavaScript", "TypeScript", "FastAPI", "Python", "PostgreSQL", "REST APIs", "Git"],
        "preferred_skills": ["Docker", "CI/CD", "Redis", "AWS"],
        "certifications": [],
        "description": "Join our product team to build scalable web applications. You'll work across the full stack — from designing beautiful UIs in React to building robust FastAPI backends.",
        "requirements": "3+ years of full-stack development experience. Strong knowledge of React hooks and state management. Experience with REST API design.",
        "benefits": "Fully remote, competitive salary, equipment allowance, health coverage, 25 days PTO",
        "ai_matching_threshold": 70,
        "selected_threshold": 85,
        "waiting_threshold": 65,
        "status": "Active",
    },
    {
        "title": "DevOps Engineer",
        "domain": "DevOps & Cloud",
        "department": "Infrastructure",
        "location": "Hyderabad, India",
        "employment_type": "Full-time",
        "work_mode": "On-site",
        "experience_level": "Mid-Level",
        "salary": "18-28 LPA",
        "education": "B.Tech in CS/IT or equivalent",
        "skills": ["Docker", "Kubernetes", "Jenkins", "Terraform", "AWS", "Linux", "Bash", "Python"],
        "preferred_skills": ["Prometheus", "Grafana", "Ansible", "GCP"],
        "certifications": ["AWS Certified DevOps Engineer", "CKA"],
        "description": "We're growing our infrastructure team and looking for a skilled DevOps Engineer to automate deployments, manage cloud infrastructure, and ensure high availability of our services.",
        "requirements": "3+ years in DevOps/SRE roles. Strong experience with Kubernetes and container orchestration. Familiarity with IaC tools like Terraform.",
        "benefits": "Health + dental insurance, on-site gym, annual bonus, learning certifications sponsored",
        "ai_matching_threshold": 70,
        "selected_threshold": 88,
        "waiting_threshold": 65,
        "status": "Active",
    },
    {
        "title": "AI/ML Research Engineer",
        "domain": "Artificial Intelligence",
        "department": "R&D",
        "location": "Pune, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Senior",
        "salary": "30-50 LPA",
        "education": "M.Tech/PhD in Computer Science, AI, or related field",
        "skills": ["Python", "PyTorch", "Transformers", "NLP", "Computer Vision", "LLMs", "CUDA"],
        "preferred_skills": ["RLHF", "RAG", "Fine-tuning LLMs", "Distributed Training"],
        "certifications": [],
        "description": "As an AI Research Engineer you'll push the frontiers of applied AI. You will prototype new models, run experiments, and translate cutting-edge research into production-ready solutions.",
        "requirements": "Experience with large language models and fine-tuning. Published research or strong GitHub portfolio. Ability to read and implement state-of-the-art ML papers.",
        "benefits": "Research publication support, conference travel, top-tier hardware, competitive compensation",
        "ai_matching_threshold": 80,
        "selected_threshold": 92,
        "waiting_threshold": 75,
        "status": "Active",
    },
    {
        "title": "Product Manager – SaaS Platform",
        "domain": "Product Management",
        "department": "Product",
        "location": "Delhi NCR, India",
        "employment_type": "Full-time",
        "work_mode": "Hybrid",
        "experience_level": "Mid-Level",
        "salary": "20-35 LPA",
        "education": "MBA or B.Tech + relevant PM experience",
        "skills": ["Product Roadmapping", "Agile", "User Research", "Data Analysis", "Stakeholder Management", "SQL"],
        "preferred_skills": ["SaaS metrics", "A/B Testing", "Mixpanel", "Jira", "Figma"],
        "certifications": ["PMP", "Agile Certified Practitioner"],
        "description": "We are looking for a driven Product Manager to own the roadmap for our SaaS platform. You'll work closely with engineering, design, and business teams to build features our users love.",
        "requirements": "3+ years of PM experience in a B2B SaaS product. Data-driven decision making. Excellent written and verbal communication.",
        "benefits": "ESOP, flexible timing, team retreats, premium health plan, parental leave",
        "ai_matching_threshold": 65,
        "selected_threshold": 82,
        "waiting_threshold": 60,
        "status": "Active",
    },
]


async def seed_jds():
    async with AsyncSessionLocal() as db:
        existing_result = await db.execute(select(JobDescription))
        existing_count = len(existing_result.scalars().all())
        print(f"Found {existing_count} existing JDs in database.")

        added = 0
        for jd_data in JDS:
            result = await db.execute(
                select(JobDescription).where(JobDescription.title == jd_data["title"])
            )
            if result.scalar_one_or_none():
                print(f"  [SKIP] '{jd_data['title']}' already exists")
                continue

            jd = JobDescription(**jd_data)
            db.add(jd)
            added += 1
            print(f"  [ADD]  '{jd_data['title']}'")

        await db.commit()
        print(f"\n✅ Done! Added {added} new JDs. Total: {existing_count + added}")


if __name__ == "__main__":
    asyncio.run(seed_jds())
