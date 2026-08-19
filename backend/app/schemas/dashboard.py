from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class StudentDashboardResponse(BaseModel):
    student_id: str
    total_resumes_uploaded: int
    latest_score: Optional[float]
    average_score: Optional[float]
    strongest_skill: Optional[str]
    weakest_skill: Optional[str]
    last_updated: datetime
    
    class Config:
        from_attributes = True

class AssignedStudent(BaseModel):
    student_id: str
    full_name: str
    latest_score: Optional[float]

class MentorDashboardResponse(BaseModel):
    mentor_id: str
    assigned_students: List[AssignedStudent]
