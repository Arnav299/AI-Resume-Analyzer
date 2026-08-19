from fastapi import APIRouter, Depends
from app.routers.deps import get_current_user
from app.models.user import User
from app.schemas.skill_gap import SkillsAnalysisResponse, SkillCategoryResponse, SkillDetail

router = APIRouter()

@router.get("/analysis", response_model=SkillsAnalysisResponse)
async def get_skills_analysis(
    current_user: User = Depends(get_current_user)
):
    """Returns detailed skills analysis breakdown."""
    # Returning mock data matching frontend structure for now
    return SkillsAnalysisResponse(
        overall_match=75,
        categories=[
            SkillCategoryResponse(
                category="Technical Skills",
                skills=[
                    SkillDetail(name="Python", level=88, matched=True),
                    SkillDetail(name="SQL", level=75, matched=True),
                    SkillDetail(name="JavaScript", level=45, matched=False)
                ]
            ),
            SkillCategoryResponse(
                category="Soft Skills",
                skills=[
                    SkillDetail(name="Communication", level=80, matched=True),
                    SkillDetail(name="Leadership", level=50, matched=False)
                ]
            )
        ]
    )
