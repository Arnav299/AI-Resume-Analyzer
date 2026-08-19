# =============================================================================
# backend/app/routers/feedback.py
# =============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from typing import List

from app.core.database import get_db
from app.routers.deps import get_current_mentor, get_current_user
from app.models.user import User
from app.models.mentor_feedback import MentorFeedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/feedback/  — submit or update mentor feedback
# ---------------------------------------------------------------------------
@router.post("/", response_model=FeedbackResponse, status_code=201)
async def submit_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_mentor),
    db: AsyncSession = Depends(get_db),
):
    """Submit mentor feedback for an analysis result."""
    # Check if feedback already exists for this mentor+analysis combo
    existing_result = await db.execute(
        select(MentorFeedback).where(
            MentorFeedback.analysis_result_id == feedback_in.analysis_result_id,
            MentorFeedback.mentor_id == current_user.id,
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        # Update in place instead of raising an error
        existing.rating = feedback_in.rating
        existing.comments = feedback_in.comments
        existing.improvement_actions = feedback_in.improvement_actions
        await db.commit()
        await db.refresh(existing)
        return existing

    feedback = MentorFeedback(
        analysis_result_id=feedback_in.analysis_result_id,
        mentor_id=current_user.id,
        rating=feedback_in.rating,
        comments=feedback_in.comments,
        improvement_actions=feedback_in.improvement_actions,
    )
    db.add(feedback)
    try:
        await db.commit()
        await db.refresh(feedback)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Feedback for this analysis already exists.",
        )
    return feedback


# ---------------------------------------------------------------------------
# GET /api/feedback/{analysis_id}  — get feedback for an analysis
# ---------------------------------------------------------------------------
@router.get("/{analysis_id}", response_model=List[FeedbackResponse])
async def get_feedback_for_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return all mentor feedback entries for a given analysis result."""
    result = await db.execute(
        select(MentorFeedback)
        .where(MentorFeedback.analysis_result_id == analysis_id)
        .order_by(MentorFeedback.created_at)
    )
    feedbacks = result.scalars().all()
    return feedbacks

