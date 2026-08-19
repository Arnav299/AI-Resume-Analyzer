import asyncio
import os
import sys

# Add backend directory to sys.path so app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.career_role import CareerRole
from app.models.skill import Skill
from app.models.role_skill import RoleSkill

ROLE_SKILLS_MAP = {
    "Data Analyst": ["python", "sql", "excel", "tableau", "power bi", "data analysis", "statistics", "pandas", "numpy"],
    "Full Stack Developer": ["html", "css", "javascript", "react", "node.js", "git", "sql", "mongodb", "express"],
    "AI/ML Beginner": ["python", "machine learning", "pandas", "numpy", "scikit-learn", "sql", "data analysis"],
    "Cloud Engineer": ["aws", "linux", "docker", "kubernetes", "python", "terraform", "ci/cd", "networking", "bash"],
}

async def seed_db():
    async with AsyncSessionLocal() as db:
        print("Seeding database...")
        
        # Insert all unique skills
        all_skills = set()
        for skills in ROLE_SKILLS_MAP.values():
            all_skills.update(skills)
            
        skill_objects = {}
        for skill_name in all_skills:
            result = await db.execute(select(Skill).where(Skill.skill_name == skill_name))
            skill = result.scalar_one_or_none()
            if not skill:
                from app.models.skill import SkillCategory
                skill = Skill(skill_name=skill_name, category=SkillCategory.Other)
                db.add(skill)
            skill_objects[skill_name] = skill
        
        await db.commit()
        
        # Refresh to get IDs
        for skill in skill_objects.values():
            await db.refresh(skill)
            
        # Seed Roles and RoleSkills
        for role_name, required_skills in ROLE_SKILLS_MAP.items():
            result = await db.execute(select(CareerRole).where(CareerRole.role_name == role_name))
            role = result.scalar_one_or_none()
            if not role:
                role = CareerRole(role_name=role_name, industry_category="Technology", description=f"{role_name} role")
                db.add(role)
                await db.commit()
                await db.refresh(role)
                
            # Now add role skills
            for skill_name in required_skills:
                skill_id = skill_objects[skill_name].id
                rs_result = await db.execute(select(RoleSkill).where(
                    RoleSkill.role_id == role.id,
                    RoleSkill.skill_id == skill_id
                ))
                rs = rs_result.scalar_one_or_none()
                if not rs:
                    rs = RoleSkill(role_id=role.id, skill_id=skill_id, importance_weight=8)
                    db.add(rs)
                    
        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
