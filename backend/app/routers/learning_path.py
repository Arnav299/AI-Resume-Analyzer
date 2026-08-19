from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.learning_path import LearningPath
from app.schemas.learning_path import LearningPathResponse, LearningPathSkillResponse

router = APIRouter()

@router.get("/{role_id}", response_model=List[LearningPathResponse])
async def get_learning_path(
    role_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return learning paths for a given role (or mock if none)."""
    # Try fetching from DB
    result = await db.execute(
        select(LearningPath).where(LearningPath.is_active == True)
    )
    paths = result.scalars().all()
    
    if paths:
        return [
            LearningPathResponse(
                id=str(p.id),
                title=p.title,
                description=p.description,
                estimated_duration=p.estimated_duration,
                difficulty_level=p.difficulty_level.value if p.difficulty_level else "beginner",
                skills=[]
            ) for p in paths
        ]
        
    # Mock fallback for new frontend
    return [
        LearningPathResponse(
            id="1",
            title="SQL for Data Analysis",
            description="Master SELECT, JOIN, GROUP BY and window functions.",
            estimated_duration="2 Weeks",
            difficulty_level="beginner",
            skills=[
                LearningPathSkillResponse(
                    skill_name="SQL",
                    difficulty_level="beginner"
                )
            ]
        ),
        LearningPathResponse(
            id="2",
            title="Python for Data Science",
            description="Learn Pandas, NumPy, Matplotlib and Seaborn.",
            estimated_duration="4 Weeks",
            difficulty_level="intermediate",
            skills=[
                LearningPathSkillResponse(
                    skill_name="Python",
                    difficulty_level="intermediate"
                )
            ]
        )
    ]
