# =============================================================================
# backend/app/routers/career_roles.py  — Career roles endpoints
# =============================================================================
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.career_role import CareerRole
from app.models.role_skill import RoleSkill
from app.schemas.career_role import CareerRoleResponse

router = APIRouter()


@router.get("/", response_model=List[CareerRoleResponse])
async def list_career_roles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all active career roles available for selection, including their required skills."""
    result = await db.execute(
        select(CareerRole)
        .where(CareerRole.is_active == True)
        .order_by(CareerRole.role_name)
        .options(selectinload(CareerRole.role_skills).selectinload(RoleSkill.skill))
    )
    roles = result.scalars().all()

    # Build response manually so we can add required_skills
    response = []
    for r in roles:
        skill_names = []
        for rs in (r.role_skills or []):
            if rs.skill and rs.skill.is_active:
                skill_names.append(rs.skill.skill_name)
        response.append(CareerRoleResponse(
            id=str(r.id),
            role_name=r.role_name,
            description=r.description,
            industry_category=r.industry_category,
            is_active=r.is_active,
            required_skills=sorted(skill_names),
        ))

    return response
