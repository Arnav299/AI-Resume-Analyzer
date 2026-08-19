import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.career_role import CareerRole

ROLES_TO_ADD = [
    ("Full Stack Developer", "Develops both client and server software.", "Software Engineering"),
    ("Frontend Developer", "Specializes in building user interfaces and web applications.", "Software Engineering"),
    ("Backend Developer", "Specializes in server-side logic, databases, and APIs.", "Software Engineering"),
    ("Cybersecurity Analyst", "Protects IT infrastructure, edge devices, networks, and data.", "Security"),
    ("Data Scientist", "Analyzes and interprets complex digital data.", "Data Science"),
    ("Data Analyst", "Translates numbers into plain English to help organizations make decisions.", "Data Science"),
    ("Machine Learning Engineer", "Designs and builds AI models and machine learning systems.", "Artificial Intelligence"),
    ("DevOps Engineer", "Introduces processes, tools, and methodologies to balance needs throughout the software development life cycle.", "Operations"),
    ("Cloud Architect", "Oversees a company's cloud computing strategy.", "Cloud Computing"),
    ("Mobile App Developer", "Designs and builds applications for mobile devices.", "Software Engineering"),
    ("UI/UX Designer", "Creates user-friendly interfaces and improves user experience.", "Design"),
    ("Database Administrator", "Uses specialized software to store and organize data.", "Database Management"),
    ("Systems Administrator", "Manages and maintains IT systems and networks.", "IT Operations"),
    ("QA Engineer", "Ensures the quality of software products through testing.", "Quality Assurance"),
    ("Network Engineer", "Sets up, develops and maintains computer networks.", "Networking"),
]

async def seed_roles():
    async with AsyncSessionLocal() as db:
        print("Starting role seeding...")
        for role_name, description, category in ROLES_TO_ADD:
            # Check if role exists (case-insensitive check)
            result = await db.execute(
                select(CareerRole).where(func.lower(CareerRole.role_name) == role_name.lower())
            )
            existing = result.scalar_one_or_none()
            if not existing:
                new_role = CareerRole(
                    role_name=role_name,
                    description=description,
                    industry_category=category,
                    is_active=True
                )
                db.add(new_role)
                print(f"Added: {role_name}")
            else:
                print(f"Skipped (already exists): {role_name}")
        
        await db.commit()
        print("Seeding complete.")

if __name__ == "__main__":
    from sqlalchemy import func
    asyncio.run(seed_roles())
