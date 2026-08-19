"""Pydantic schemas for Career Role endpoints."""
from pydantic import BaseModel
from typing import Optional, List


class CareerRoleResponse(BaseModel):
    id: str
    role_name: str
    description: Optional[str] = None
    industry_category: Optional[str] = None
    is_active: bool = True
    required_skills: List[str] = []

    class Config:
        from_attributes = True
