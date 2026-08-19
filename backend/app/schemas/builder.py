from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class BuilderPersonalInfo(BaseModel):
    fullName: Optional[str] = ""
    jobTitle: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    portfolio: Optional[str] = ""
    photo: Optional[str] = None

class BuilderExperience(BaseModel):
    id: str
    company: str
    role: str
    startDate: str
    endDate: str
    description: str

class BuilderEducation(BaseModel):
    id: str
    institution: str
    degree: str
    year: str

class BuilderProject(BaseModel):
    id: str
    name: str
    link: str
    tools: str
    description: str

class BuilderCertification(BaseModel):
    id: str
    name: str
    issuer: str
    date: str

class ResumeBuilderSaveRequest(BaseModel):
    personalInfo: BuilderPersonalInfo
    summary: str
    skills: List[str]
    experience: List[BuilderExperience]
    education: List[BuilderEducation]
    projects: List[BuilderProject]
    certifications: List[BuilderCertification]
