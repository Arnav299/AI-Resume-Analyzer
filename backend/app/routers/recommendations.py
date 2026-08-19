from fastapi import APIRouter, Depends
from app.routers.deps import get_current_user
from app.models.user import User
from app.schemas.recommendation import AIRecommendationsResponse, CareerSuggestionResponse, ImprovementTipResponse

router = APIRouter()

@router.get("/", response_model=AIRecommendationsResponse)
async def get_recommendations(
    current_user: User = Depends(get_current_user)
):
    """Returns AI recommendations and profile improvement tips."""
    # Returning mocked data for the AI recommendations to match frontend exactly
    return AIRecommendationsResponse(
        career_suggestions=[
            CareerSuggestionResponse(
                id="1",
                title="Data Analyst",
                match_percentage=80,
                description="High demand career. Leverage your analysis and SQL skills.",
                tags=["SQL", "Excel", "Python"],
                demand="High"
            ),
            CareerSuggestionResponse(
                id="2",
                title="Business Intelligence Analyst",
                match_percentage=70,
                description="Use your Excel and SQL skills to grow in BI domain.",
                tags=["SQL", "Power BI", "Excel"],
                demand="High"
            )
        ],
        improvement_tips=[
            ImprovementTipResponse(
                title="Add Quantified Achievements",
                description="Use numbers to showcase impact.",
                priority="High"
            ),
            ImprovementTipResponse(
                title="Add Certifications",
                description="Add relevant certificates.",
                priority="Medium"
            )
        ]
    )
