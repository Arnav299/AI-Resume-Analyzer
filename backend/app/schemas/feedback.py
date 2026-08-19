from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    analysis_result_id: str
    rating: int
    comments: Optional[str] = None
    improvement_actions: Optional[List[str]] = None

class FeedbackResponse(BaseModel):
    id: str
    analysis_result_id: str
    mentor_id: str
    rating: int
    comments: Optional[str]
    improvement_actions: Optional[List[str]]
    created_at: datetime
    
    class Config:
        from_attributes = True
