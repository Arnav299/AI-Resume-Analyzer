"""
seed_skills.py — Seed the skills library and role→skill mappings.

Run once (or re-run safely) from the backend/ directory:
    .venv\\Scripts\\python.exe seed_skills.py

This script:
1. Inserts skills into the `skills` table (skips duplicates).
2. Creates career roles if they don't exist yet.
3. Maps skills → roles via the `role_skills` join table (skips existing links).
"""
import asyncio
import sys

sys.path.insert(0, ".")

from sqlalchemy import select
from app.core.database import engine, AsyncSessionLocal
from app.models import Base
from app.models.skill import Skill, SkillCategory
from app.models.career_role import CareerRole
from app.models.role_skill import RoleSkill

# ---------------------------------------------------------------------------
# Master skill library  (name must match what skill_extractor.py looks for)
# ---------------------------------------------------------------------------
SKILLS = [
    # Programming
    ("python",              SkillCategory.Programming),
    ("java",                SkillCategory.Programming),
    ("javascript",          SkillCategory.Programming),
    ("typescript",          SkillCategory.Programming),
    ("c++",                 SkillCategory.Programming),
    ("c#",                  SkillCategory.Programming),
    ("go",                  SkillCategory.Programming),
    ("rust",                SkillCategory.Programming),
    ("kotlin",              SkillCategory.Programming),
    ("swift",               SkillCategory.Programming),
    ("r",                   SkillCategory.Programming),
    ("matlab",              SkillCategory.Programming),
    ("bash",                SkillCategory.Programming),
    ("shell",               SkillCategory.Programming),
    # Frontend
    ("html",                SkillCategory.Frontend),
    ("css",                 SkillCategory.Frontend),
    ("react",               SkillCategory.Frontend),
    ("angular",             SkillCategory.Frontend),
    ("vue",                 SkillCategory.Frontend),
    ("nextjs",              SkillCategory.Frontend),
    ("tailwindcss",         SkillCategory.Frontend),
    ("redux",               SkillCategory.Frontend),
    ("sass",                SkillCategory.Frontend),
    ("webpack",             SkillCategory.Frontend),
    ("vite",                SkillCategory.Frontend),
    # Backend
    ("node.js",             SkillCategory.Backend),
    ("express",             SkillCategory.Backend),
    ("fastapi",             SkillCategory.Backend),
    ("django",              SkillCategory.Backend),
    ("flask",               SkillCategory.Backend),
    ("spring boot",         SkillCategory.Backend),
    ("graphql",             SkillCategory.Backend),
    ("rest api",            SkillCategory.Backend),
    ("grpc",                SkillCategory.Backend),
    ("laravel",             SkillCategory.Backend),
    # Databases
    ("sql",                 SkillCategory.Database),
    ("mysql",               SkillCategory.Database),
    ("postgresql",          SkillCategory.Database),
    ("mongodb",             SkillCategory.Database),
    ("redis",               SkillCategory.Database),
    ("sqlite",              SkillCategory.Database),
    ("elasticsearch",       SkillCategory.Database),
    ("firebase",            SkillCategory.Database),
    ("dynamodb",            SkillCategory.Database),
    ("cassandra",           SkillCategory.Database),
    # Cloud & DevOps
    ("aws",                 SkillCategory.Cloud),
    ("azure",               SkillCategory.Cloud),
    ("gcp",                 SkillCategory.Cloud),
    ("docker",              SkillCategory.DevOps),
    ("kubernetes",          SkillCategory.DevOps),
    ("terraform",           SkillCategory.DevOps),
    ("jenkins",             SkillCategory.DevOps),
    ("github actions",      SkillCategory.DevOps),
    ("ci/cd",               SkillCategory.DevOps),
    ("linux",               SkillCategory.DevOps),
    ("nginx",               SkillCategory.DevOps),
    ("ansible",             SkillCategory.DevOps),
    # AI / ML
    ("machine learning",        SkillCategory.AI_ML),
    ("deep learning",           SkillCategory.AI_ML),
    ("nlp",                     SkillCategory.AI_ML),
    ("computer vision",         SkillCategory.AI_ML),
    ("tensorflow",              SkillCategory.AI_ML),
    ("pytorch",                 SkillCategory.AI_ML),
    ("keras",                   SkillCategory.AI_ML),
    ("scikit-learn",            SkillCategory.AI_ML),
    ("hugging face",            SkillCategory.AI_ML),
    ("langchain",               SkillCategory.AI_ML),
    ("llm",                     SkillCategory.AI_ML),
    ("rag",                     SkillCategory.AI_ML),
    ("openai",                  SkillCategory.AI_ML),
    # Data Analytics
    ("pandas",              SkillCategory.Data_Analytics),
    ("numpy",               SkillCategory.Data_Analytics),
    ("matplotlib",          SkillCategory.Data_Analytics),
    ("power bi",            SkillCategory.Data_Analytics),
    ("tableau",             SkillCategory.Data_Analytics),
    ("spark",               SkillCategory.Data_Analytics),
    ("kafka",               SkillCategory.Data_Analytics),
    ("airflow",             SkillCategory.Data_Analytics),
    ("dbt",                 SkillCategory.Data_Analytics),
    ("etl",                 SkillCategory.Data_Analytics),
    ("data analysis",       SkillCategory.Data_Analytics),
    ("data science",        SkillCategory.Data_Analytics),
    # Tools
    ("git",                 SkillCategory.Other),
    ("github",              SkillCategory.Other),
    ("jira",                SkillCategory.Other),
    ("postman",             SkillCategory.Other),
    ("figma",               SkillCategory.Other),
    ("agile",               SkillCategory.Other),
    ("scrum",               SkillCategory.Other),
]

# ---------------------------------------------------------------------------
# Role → required skill mappings
# Keys are compared case-insensitively to role_name in the DB.
# If a role doesn't exist in the DB it will be created.
# ---------------------------------------------------------------------------
ROLE_SKILLS: dict[str, list[tuple[str, int]]] = {
    "full stack developer": [
        ("python", 7), ("javascript", 9), ("typescript", 8),
        ("react", 9), ("node.js", 8), ("html", 8), ("css", 8),
        ("sql", 7), ("postgresql", 7), ("mongodb", 6),
        ("rest api", 8), ("git", 7), ("docker", 6),
        ("redis", 5), ("nextjs", 6),
    ],
    "frontend developer": [
        ("javascript", 10), ("typescript", 8), ("react", 10),
        ("html", 9), ("css", 9), ("nextjs", 7), ("redux", 7),
        ("tailwindcss", 6), ("sass", 5), ("git", 7),
        ("figma", 6), ("vite", 5), ("webpack", 5),
    ],
    "backend developer": [
        ("python", 8), ("java", 7), ("node.js", 8),
        ("fastapi", 7), ("django", 7), ("spring boot", 6),
        ("sql", 9), ("postgresql", 8), ("mongodb", 7),
        ("redis", 6), ("rest api", 9), ("docker", 7),
        ("git", 8), ("linux", 6), ("ci/cd", 6),
    ],
    "data scientist": [
        ("python", 10), ("machine learning", 10), ("deep learning", 8),
        ("pandas", 9), ("numpy", 9), ("scikit-learn", 9),
        ("tensorflow", 7), ("pytorch", 7), ("sql", 7),
        ("data analysis", 9), ("data science", 10), ("matplotlib", 7),
        ("nlp", 6), ("r", 5),
    ],
    "data analyst": [
        ("sql", 10), ("python", 8), ("pandas", 9),
        ("data analysis", 10), ("tableau", 7), ("power bi", 7),
        ("matplotlib", 6), ("numpy", 7),
        ("git", 5), ("etl", 6), ("postgresql", 6),
    ],
    "ai/ml engineer": [
        ("python", 10), ("machine learning", 10), ("deep learning", 9),
        ("tensorflow", 8), ("pytorch", 9), ("scikit-learn", 8),
        ("nlp", 7), ("computer vision", 6),
        ("docker", 7), ("aws", 6), ("sql", 6),
        ("pandas", 8), ("numpy", 8), ("git", 7),
        ("langchain", 7), ("llm", 8), ("hugging face", 7),
    ],
    "devops engineer": [
        ("docker", 10), ("kubernetes", 9), ("linux", 9),
        ("ci/cd", 10), ("terraform", 8), ("ansible", 7),
        ("aws", 8), ("azure", 6), ("jenkins", 7),
        ("github actions", 7), ("bash", 7), ("git", 8),
        ("nginx", 6), ("python", 5),
    ],
    "cloud solutions architect": [
        ("aws", 10), ("azure", 8), ("gcp", 7),
        ("docker", 8), ("kubernetes", 8), ("terraform", 9),
        ("linux", 8), ("python", 6), ("bash", 7),
        ("ci/cd", 7), ("ansible", 6),
    ],
    "mobile developer": [
        ("kotlin", 8), ("swift", 8), ("java", 7),
        ("react", 6), ("git", 7),
        ("rest api", 8), ("firebase", 7), ("sql", 6),
        ("agile", 5),
    ],
    "ai engineer": [
        ("python", 10), ("machine learning", 9), ("deep learning", 9),
        ("llm", 9), ("langchain", 8), ("rag", 7),
        ("openai", 7), ("hugging face", 8), ("pytorch", 8),
        ("nlp", 8), ("docker", 6), ("aws", 6),
        ("rest api", 7), ("git", 7),
    ],
    "software engineer": [
        ("python", 8), ("java", 7), ("javascript", 7),
        ("sql", 7), ("git", 9), ("rest api", 7),
        ("docker", 6), ("agile", 7), ("scrum", 6),
        ("linux", 5), ("ci/cd", 5),
    ],
    "data engineer": [
        ("python", 9), ("sql", 10), ("spark", 8),
        ("kafka", 7), ("airflow", 7), ("dbt", 6),
        ("etl", 9), ("aws", 7), ("postgresql", 7),
        ("mongodb", 5), ("docker", 6), ("git", 7),
        ("pandas", 7),
    ],
}


async def seed():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:

        # ── 1. Upsert skills ─────────────────────────────────────────────────
        skill_map: dict[str, str] = {}   # skill_name_lower → skill.id
        new_skills = 0
        for skill_name, category in SKILLS:
            res = await db.execute(select(Skill).where(Skill.skill_name == skill_name))
            skill = res.scalar_one_or_none()
            if not skill:
                skill = Skill(skill_name=skill_name, category=category)
                db.add(skill)
                await db.flush()
                new_skills += 1
                print(f"  [+] Skill: {skill_name}")
            skill_map[skill_name.lower()] = str(skill.id)

        await db.commit()
        print(f"\n✅ Skills: {new_skills} added | {len(skill_map)} total in library\n")

        # ── 2. Load existing roles (case-insensitive lookup) ──────────────────
        roles_res = await db.execute(select(CareerRole))
        all_roles = roles_res.scalars().all()
        role_map: dict[str, CareerRole] = {r.role_name.lower(): r for r in all_roles}

        # ── 3. Upsert role→skill links ────────────────────────────────────────
        new_roles = 0
        new_links = 0
        for role_key, skill_weights in ROLE_SKILLS.items():
            role = role_map.get(role_key.lower())
            if not role:
                role = CareerRole(
                    role_name=role_key.title(),
                    industry_category="Technology",
                )
                db.add(role)
                await db.flush()
                role_map[role_key.lower()] = role
                new_roles += 1
                print(f"  [+] Role: {role.role_name}")

            for skill_name, weight in skill_weights:
                skill_id = skill_map.get(skill_name.lower())
                if not skill_id:
                    print(f"  [!] Skill '{skill_name}' not in library – skipped")
                    continue
                existing = await db.execute(
                    select(RoleSkill).where(
                        RoleSkill.role_id == str(role.id),
                        RoleSkill.skill_id == skill_id,
                    )
                )
                if not existing.scalar_one_or_none():
                    db.add(RoleSkill(
                        role_id=str(role.id),
                        skill_id=skill_id,
                        importance_weight=weight,
                    ))
                    new_links += 1

        await db.commit()
        print(f"\n✅ Roles: {new_roles} created | {len(role_map)} total")
        print(f"✅ Role→Skill links: {new_links} added")
        print("\nAll done! Re-run analysis – results will now differ per resume.")


if __name__ == "__main__":
    asyncio.run(seed())
