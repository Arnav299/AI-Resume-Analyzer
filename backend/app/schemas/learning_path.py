from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class LearningPathSkillResponse(BaseModel):
    skill_name: str
    difficulty_level: str
    estimated_duration: Optional[str] = None
    resources_url: Optional[str] = None

class LearningPathResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    estimated_duration: Optional[str]
    difficulty_level: str
    skills: List[LearningPathSkillResponse] = []
    
    class Config:
        from_attributes = True
