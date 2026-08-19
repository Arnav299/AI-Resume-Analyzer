from pydantic import BaseModel
from typing import List, Optional

class CareerSuggestionResponse(BaseModel):
    id: str
    title: str
    match_percentage: int
    description: str
    tags: List[str]
    demand: str
    
class ImprovementTipResponse(BaseModel):
    title: str
    description: str
    priority: str
    
class AIRecommendationsResponse(BaseModel):
    career_suggestions: List[CareerSuggestionResponse]
    improvement_tips: List[ImprovementTipResponse]
