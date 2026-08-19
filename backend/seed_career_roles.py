"""
Seed 12 career roles into the database.
Run with: python seed_career_roles.py
"""
import asyncio
import sys
import uuid

sys.path.insert(0, ".")

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.career_role import CareerRole

ROLES = [
    {
        "role_name": "Software Engineer",
        "description": "Design, develop, and maintain software systems and applications using modern programming languages and frameworks.",
        "industry_category": "Technology",
    },
    {
        "role_name": "Data Scientist",
        "description": "Analyze complex datasets, build machine learning models, and extract actionable insights to drive business decisions.",
        "industry_category": "Data & Analytics",
    },
    {
        "role_name": "Data Analyst",
        "description": "Collect, process, and analyze data to help organizations make informed decisions using statistical techniques and visualization tools.",
        "industry_category": "Data & Analytics",
    },
    {
        "role_name": "Frontend Developer",
        "description": "Build and maintain user-facing web applications using HTML, CSS, JavaScript, and modern frameworks like React or Vue.",
        "industry_category": "Technology",
    },
    {
        "role_name": "Backend Developer",
        "description": "Develop and maintain server-side logic, APIs, databases, and infrastructure that power web and mobile applications.",
        "industry_category": "Technology",
    },
    {
        "role_name": "Full Stack Developer",
        "description": "Work across both frontend and backend systems to build complete web applications end-to-end.",
        "industry_category": "Technology",
    },
    {
        "role_name": "Machine Learning Engineer",
        "description": "Design and deploy machine learning models and pipelines at scale, bridging data science and software engineering.",
        "industry_category": "Data & Analytics",
    },
    {
        "role_name": "DevOps Engineer",
        "description": "Implement CI/CD pipelines, manage cloud infrastructure, and ensure reliability and scalability of software systems.",
        "industry_category": "Technology",
    },
    {
        "role_name": "Cloud Engineer",
        "description": "Design, build, and manage cloud-based infrastructure and services on platforms like AWS, Azure, or GCP.",
        "industry_category": "Technology",
    },
    {
        "role_name": "UI/UX Designer",
        "description": "Create intuitive user interfaces and seamless user experiences through research, wireframing, prototyping, and visual design.",
        "industry_category": "Design",
    },
    {
        "role_name": "Product Manager",
        "description": "Define product vision and strategy, collaborate with cross-functional teams, and drive the roadmap from ideation to launch.",
        "industry_category": "Business",
    },
    {
        "role_name": "Cybersecurity Analyst",
        "description": "Protect organizational systems and data by identifying vulnerabilities, responding to threats, and implementing security controls.",
        "industry_category": "Technology",
    },
]


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(CareerRole.role_name))
        existing_names = {r[0].lower() for r in result.all()}

        added = 0
        skipped = 0
        for role_data in ROLES:
            name = role_data["role_name"]
            if name.lower() in existing_names:
                print(f"  SKIP (exists): {name}")
                skipped += 1
                continue
            role = CareerRole(
                id=str(uuid.uuid4()),
                role_name=name,
                description=role_data["description"],
                industry_category=role_data["industry_category"],
                is_active=True,
            )
            db.add(role)
            print(f"  ADD: {name}")
            added += 1

        await db.commit()
        print(f"\nDone: {added} added, {skipped} skipped.")

        # Verify
        total = await db.execute(select(CareerRole).where(CareerRole.is_active == True))
        all_roles = total.scalars().all()
        print(f"Total active career roles now: {len(all_roles)}")
        for r in sorted(all_roles, key=lambda x: x.role_name):
            print(f"  - {r.role_name}  [{r.industry_category}]")


if __name__ == "__main__":
    asyncio.run(main())
