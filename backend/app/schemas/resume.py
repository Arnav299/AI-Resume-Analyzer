from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    message: str

class ResumeResponse(BaseModel):
    id: str
    student_profile_id: str
    original_filename: str
    upload_status: str
    uploaded_at: datetime
    
    class Config:
        from_attributes = True
