from pydantic import BaseModel
from typing import List

class SkillDetail(BaseModel):
    name: str
    level: int
    matched: bool

class SkillCategoryResponse(BaseModel):
    category: str
    skills: List[SkillDetail]

class SkillsAnalysisResponse(BaseModel):
    overall_match: int
    categories: List[SkillCategoryResponse]
