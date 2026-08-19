"""
Seed required skills for all 12 career roles.
Run with: python seed_role_skills.py
"""
import asyncio
import sys
import uuid

sys.path.insert(0, ".")

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.career_role import CareerRole
from app.models.skill import Skill, SkillCategory
from app.models.role_skill import RoleSkill

# role_name -> list of (skill_name, category, importance_weight 1-10)
ROLE_SKILLS = {
    "Software Engineer": [
        ("Python",          SkillCategory.Programming, 9),
        ("Java",            SkillCategory.Programming, 8),
        ("JavaScript",      SkillCategory.Programming, 8),
        ("Data Structures", SkillCategory.Programming, 9),
        ("Algorithms",      SkillCategory.Programming, 9),
        ("Git",             SkillCategory.DevOps,      8),
        ("REST API",        SkillCategory.Backend,     8),
        ("SQL",             SkillCategory.Database,    7),
        ("Docker",          SkillCategory.DevOps,      7),
        ("Unit Testing",    SkillCategory.Other,       7),
        ("System Design",   SkillCategory.Other,       8),
        ("CI/CD",           SkillCategory.DevOps,      6),
    ],
    "Data Scientist": [
        ("Python",              SkillCategory.Programming,    10),
        ("Machine Learning",    SkillCategory.AI_ML,          10),
        ("Statistics",          SkillCategory.Data_Analytics, 9),
        ("Pandas",              SkillCategory.Data_Analytics, 9),
        ("NumPy",               SkillCategory.Data_Analytics, 8),
        ("Scikit-learn",        SkillCategory.AI_ML,          8),
        ("TensorFlow",          SkillCategory.AI_ML,          7),
        ("Data Visualization",  SkillCategory.Data_Analytics, 8),
        ("SQL",                 SkillCategory.Database,       8),
        ("Deep Learning",       SkillCategory.AI_ML,          7),
        ("Feature Engineering", SkillCategory.AI_ML,          8),
        ("Jupyter Notebook",    SkillCategory.Data_Analytics, 7),
    ],
    "data analyst": [
        ("SQL",              SkillCategory.Database,       10),
        ("Excel",            SkillCategory.Data_Analytics, 9),
        ("Python",           SkillCategory.Programming,    8),
        ("Tableau",          SkillCategory.Data_Analytics, 8),
        ("Power BI",         SkillCategory.Data_Analytics, 8),
        ("Data Cleaning",    SkillCategory.Data_Analytics, 9),
        ("Statistics",       SkillCategory.Data_Analytics, 8),
        ("Data Visualization", SkillCategory.Data_Analytics, 9),
        ("Pandas",           SkillCategory.Data_Analytics, 7),
        ("Reporting",        SkillCategory.Data_Analytics, 8),
        ("Business Intelligence", SkillCategory.Data_Analytics, 7),
    ],
    "Frontend Developer": [
        ("HTML",          SkillCategory.Frontend,    10),
        ("CSS",           SkillCategory.Frontend,    10),
        ("JavaScript",    SkillCategory.Programming, 10),
        ("React",         SkillCategory.Frontend,    9),
        ("TypeScript",    SkillCategory.Programming, 8),
        ("Responsive Design", SkillCategory.Frontend, 8),
        ("Git",           SkillCategory.DevOps,      7),
        ("REST API",      SkillCategory.Backend,     7),
        ("Tailwind CSS",  SkillCategory.Frontend,    7),
        ("Web Performance", SkillCategory.Frontend,  7),
        ("Accessibility", SkillCategory.Frontend,    6),
    ],
    "Backend Developer": [
        ("Python",        SkillCategory.Programming, 9),
        ("Node.js",       SkillCategory.Backend,     9),
        ("Java",          SkillCategory.Programming, 8),
        ("REST API",      SkillCategory.Backend,     10),
        ("SQL",           SkillCategory.Database,    9),
        ("PostgreSQL",    SkillCategory.Database,    8),
        ("MongoDB",       SkillCategory.Database,    7),
        ("Docker",        SkillCategory.DevOps,      8),
        ("Git",           SkillCategory.DevOps,      8),
        ("Authentication", SkillCategory.Backend,   8),
        ("Microservices", SkillCategory.Backend,     7),
        ("Message Queues", SkillCategory.Backend,   6),
    ],
    "Full Stack Developer": [
        ("JavaScript",    SkillCategory.Programming, 10),
        ("React",         SkillCategory.Frontend,    9),
        ("Node.js",       SkillCategory.Backend,     9),
        ("HTML",          SkillCategory.Frontend,    9),
        ("CSS",           SkillCategory.Frontend,    9),
        ("REST API",      SkillCategory.Backend,     9),
        ("SQL",           SkillCategory.Database,    8),
        ("Git",           SkillCategory.DevOps,      8),
        ("Docker",        SkillCategory.DevOps,      7),
        ("TypeScript",    SkillCategory.Programming, 7),
        ("MongoDB",       SkillCategory.Database,    7),
        ("AWS",           SkillCategory.Cloud,       6),
    ],
    "Machine Learning Engineer": [
        ("Python",          SkillCategory.Programming, 10),
        ("Machine Learning", SkillCategory.AI_ML,     10),
        ("Deep Learning",   SkillCategory.AI_ML,       9),
        ("TensorFlow",      SkillCategory.AI_ML,       9),
        ("PyTorch",         SkillCategory.AI_ML,       9),
        ("MLOps",           SkillCategory.AI_ML,       8),
        ("Docker",          SkillCategory.DevOps,      8),
        ("Kubernetes",      SkillCategory.DevOps,      7),
        ("SQL",             SkillCategory.Database,    7),
        ("Cloud Platforms", SkillCategory.Cloud,       7),
        ("Model Deployment", SkillCategory.AI_ML,     8),
        ("Feature Engineering", SkillCategory.AI_ML,  8),
    ],
    "DevOps Engineer": [
        ("Linux",           SkillCategory.DevOps,   10),
        ("Docker",          SkillCategory.DevOps,    10),
        ("Kubernetes",      SkillCategory.DevOps,    9),
        ("CI/CD",           SkillCategory.DevOps,    10),
        ("AWS",             SkillCategory.Cloud,     8),
        ("Terraform",       SkillCategory.DevOps,    8),
        ("Jenkins",         SkillCategory.DevOps,    8),
        ("Shell Scripting", SkillCategory.Programming, 8),
        ("Ansible",         SkillCategory.DevOps,    7),
        ("Git",             SkillCategory.DevOps,    8),
        ("Monitoring",      SkillCategory.DevOps,    7),
        ("Networking",      SkillCategory.Other,     7),
    ],
    "Cloud Engineer": [
        ("AWS",             SkillCategory.Cloud,    10),
        ("Azure",           SkillCategory.Cloud,     8),
        ("GCP",             SkillCategory.Cloud,     8),
        ("Terraform",       SkillCategory.DevOps,    9),
        ("Docker",          SkillCategory.DevOps,    9),
        ("Kubernetes",      SkillCategory.DevOps,    8),
        ("Linux",           SkillCategory.DevOps,    8),
        ("Networking",      SkillCategory.Other,     8),
        ("Security",        SkillCategory.Other,     8),
        ("Infrastructure as Code", SkillCategory.DevOps, 9),
        ("CI/CD",           SkillCategory.DevOps,    7),
        ("Python",          SkillCategory.Programming, 7),
    ],
    "UI/UX Designer": [
        ("Figma",           SkillCategory.Other,   10),
        ("User Research",   SkillCategory.Other,    9),
        ("Wireframing",     SkillCategory.Other,    9),
        ("Prototyping",     SkillCategory.Other,    9),
        ("Usability Testing", SkillCategory.Other,  8),
        ("Information Architecture", SkillCategory.Other, 8),
        ("Visual Design",   SkillCategory.Other,    9),
        ("Design Systems",  SkillCategory.Other,    8),
        ("Adobe XD",        SkillCategory.Other,    7),
        ("HTML",            SkillCategory.Frontend,  6),
        ("CSS",             SkillCategory.Frontend,  6),
        ("Accessibility",   SkillCategory.Frontend,  7),
    ],
    "Product Manager": [
        ("Product Strategy",   SkillCategory.Other, 10),
        ("Roadmapping",        SkillCategory.Other,  9),
        ("Agile",              SkillCategory.Other,  9),
        ("Scrum",              SkillCategory.Other,  8),
        ("Data Analysis",      SkillCategory.Data_Analytics, 8),
        ("User Stories",       SkillCategory.Other,  9),
        ("Stakeholder Management", SkillCategory.Soft_Skills, 9),
        ("Market Research",    SkillCategory.Other,  8),
        ("A/B Testing",        SkillCategory.Other,  7),
        ("SQL",                SkillCategory.Database, 6),
        ("Jira",               SkillCategory.Other,  7),
        ("Communication",      SkillCategory.Soft_Skills, 9),
    ],
    "Cybersecurity Analyst": [
        ("Network Security",    SkillCategory.Other, 10),
        ("Vulnerability Assessment", SkillCategory.Other, 10),
        ("SIEM",                SkillCategory.Other,  9),
        ("Penetration Testing", SkillCategory.Other,  8),
        ("Incident Response",   SkillCategory.Other,  9),
        ("Firewalls",           SkillCategory.Other,  8),
        ("Linux",               SkillCategory.DevOps, 8),
        ("Python",              SkillCategory.Programming, 7),
        ("Cryptography",        SkillCategory.Other,  7),
        ("Risk Assessment",     SkillCategory.Other,  9),
        ("Compliance",          SkillCategory.Other,  8),
        ("Wireshark",           SkillCategory.Other,  7),
    ],
}


async def main():
    async with AsyncSessionLocal() as db:
        # Load all roles
        role_result = await db.execute(select(CareerRole).where(CareerRole.is_active == True))
        roles = {r.role_name: r for r in role_result.scalars().all()}

        # Load existing skills into a name->Skill map
        skill_result = await db.execute(select(Skill))
        skills_map = {s.skill_name.lower(): s for s in skill_result.scalars().all()}

        total_added = 0
        total_skipped = 0

        for role_name, skill_list in ROLE_SKILLS.items():
            role = roles.get(role_name)
            if not role:
                print(f"  ROLE NOT FOUND: {role_name}")
                continue

            # Load existing role->skill mappings
            rs_result = await db.execute(
                select(RoleSkill).where(RoleSkill.role_id == role.id)
            )
            existing_skill_ids = {rs.skill_id for rs in rs_result.scalars().all()}

            for skill_name, category, weight in skill_list:
                skill_key = skill_name.lower()
                # Get or create the Skill record
                skill = skills_map.get(skill_key)
                if not skill:
                    skill = Skill(
                        id=str(uuid.uuid4()),
                        skill_name=skill_name,
                        category=category,
                        is_active=True,
                    )
                    db.add(skill)
                    await db.flush()  # get the ID
                    skills_map[skill_key] = skill
                    print(f"    NEW SKILL: {skill_name}")

                if skill.id in existing_skill_ids:
                    total_skipped += 1
                    continue

                role_skill = RoleSkill(
                    id=str(uuid.uuid4()),
                    role_id=role.id,
                    skill_id=skill.id,
                    importance_weight=weight,
                )
                db.add(role_skill)
                total_added += 1

            print(f"  Processed: {role_name}")

        await db.commit()
        print(f"\nDone: {total_added} role-skill mappings added, {total_skipped} skipped.")

        # Verify
        print("\nFinal skill counts per role:")
        for role_name, role in sorted(roles.items()):
            rs = await db.execute(select(RoleSkill).where(RoleSkill.role_id == role.id))
            count = len(rs.scalars().all())
            print(f"  {role_name}: {count} skills")


if __name__ == "__main__":
    asyncio.run(main())
