import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.analysis_result import AnalysisResult
from app.routers.deps import get_current_user
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

router = APIRouter()

@router.get("/{resume_id}/report/download")
async def download_report(
    resume_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch analysis
    result = await db.execute(select(AnalysisResult).where(AnalysisResult.resume_id == resume_id))
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found")
        
    pdf_path = f"/tmp/report_{resume_id}.pdf"
    
    # Very basic PDF generation for the report
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.drawString(100, 750, f"Analysis Report for Resume: {resume_id}")
    c.drawString(100, 730, f"Readiness Score: {analysis.readiness_score}")
    c.drawString(100, 710, f"Skill Score: {analysis.skill_score}")
    c.drawString(100, 690, f"Project Score: {analysis.project_score}")
    
    c.drawString(100, 650, "Strengths:")
    y = 630
    for s in (analysis.strengths or []):
        c.drawString(120, y, f"- {s}")
        y -= 20
        
    c.drawString(100, y - 20, "Weaknesses:")
    y -= 40
    for w in (analysis.weaknesses or []):
        c.drawString(120, y, f"- {w}")
        y -= 20
        
    c.save()
    
    return FileResponse(pdf_path, filename="analysis_report.pdf", media_type="application/pdf")
