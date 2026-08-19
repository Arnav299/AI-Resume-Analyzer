from fastapi import APIRouter, Depends, UploadFile, File
from typing import Dict, Any
from app.routers.deps import get_current_user
from app.models.user import User
from app.schemas.builder import ResumeBuilderSaveRequest
from app.services.builder_ocr_service import process_ocr_image

router = APIRouter()

# In-memory storage for builder data to simulate DB saving for the builder 
# since we are avoiding database schema changes for now.
builder_store: Dict[str, Any] = {}

@router.post("/save")
async def save_built_resume(
    request: ResumeBuilderSaveRequest,
    current_user: User = Depends(get_current_user)
):
    """Saves the JSON built resume."""
    user_id = str(current_user.id)
    builder_store[user_id] = request.model_dump()
    return {"status": "success", "message": "Resume saved successfully."}

@router.get("/load")
async def load_built_resume(
    current_user: User = Depends(get_current_user)
):
    """Loads the user's saved JSON built resume."""
    user_id = str(current_user.id)
    if user_id in builder_store:
        return {"data": builder_store[user_id]}
    return {"data": None, "message": "No saved resume found."}

@router.post("/ocr")
async def upload_ocr_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Extracts text from a resume image using production-ready OCR pipeline.
    """
    content = await file.read()
    return await process_ocr_image(content, file.filename)
