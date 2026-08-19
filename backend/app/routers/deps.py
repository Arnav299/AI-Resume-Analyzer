# =============================================================================
# backend/app/routers/deps.py — FastAPI Dependencies
# =============================================================================
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.schemas.token import TokenPayload

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception
    return user

async def get_current_student(current_user: User = Depends(get_current_user)) -> User:
    return current_user

async def get_current_mentor(current_user: User = Depends(get_current_user)) -> User:
    return current_user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    return current_user

async def get_current_admin_or_recruiter(current_user: User = Depends(get_current_user)) -> User:
    return current_user
