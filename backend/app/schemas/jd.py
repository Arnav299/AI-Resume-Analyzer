# =============================================================================
# backend/app/schemas/jd.py — Pydantic schemas for Job Descriptions
# =============================================================================
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


class JDCreate(BaseModel):
    title: str = Field(..., description="Job Title")
    company: Optional[str] = None
    domain: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employmentType: Optional[str] = Field(default="Full-time", alias="employment_type")
    workMode: Optional[str] = Field(default="On-site", alias="work_mode")
    salary: Optional[str] = None
    experienceLevel: Optional[str] = Field(default="Mid-Level", alias="experience_level")
    education: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    skills: Optional[List[str]] = Field(default_factory=list)
    preferredSkills: Optional[List[str]] = Field(default_factory=list, alias="preferred_skills")
    certifications: Optional[List[str]] = Field(default_factory=list)
    weights: Optional[Dict[str, Any]] = Field(default_factory=dict)
    aiMatchingThreshold: Optional[int] = Field(default=70, alias="ai_matching_threshold")
    selectedThreshold: Optional[int] = Field(default=90, alias="selected_threshold")
    waitingThreshold: Optional[int] = Field(default=75, alias="waiting_threshold")
    status: Optional[str] = Field(default="Active")

    model_config = ConfigDict(populate_by_name=True)


class JDUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    domain: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employmentType: Optional[str] = Field(default=None, alias="employment_type")
    workMode: Optional[str] = Field(default=None, alias="work_mode")
    salary: Optional[str] = None
    experienceLevel: Optional[str] = Field(default=None, alias="experience_level")
    education: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    skills: Optional[List[str]] = None
    preferredSkills: Optional[List[str]] = Field(default=None, alias="preferred_skills")
    certifications: Optional[List[str]] = None
    weights: Optional[Dict[str, Any]] = None
    aiMatchingThreshold: Optional[int] = Field(default=None, alias="ai_matching_threshold")
    selectedThreshold: Optional[int] = Field(default=None, alias="selected_threshold")
    waitingThreshold: Optional[int] = Field(default=None, alias="waiting_threshold")
    status: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class JDResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    company: Optional[str] = None
    domain: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    salary: Optional[str] = None
    experience_level: Optional[str] = None
    education: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    weights: Optional[Dict[str, Any]] = None
    ai_matching_threshold: Optional[int] = None
    selected_threshold: Optional[int] = None
    waiting_threshold: Optional[int] = None
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
