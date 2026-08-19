# =============================================================================
# backend/app/routers/auth.py
# =============================================================================
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User, UserRole
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.routers.deps import get_current_user

settings = get_settings()
router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # Standardize email
    email = form_data.username.strip().lower()
    
    # Retrieve user
    result = await db.execute(select(User).where(func.lower(User.email) == email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last_login timestamp
    from datetime import datetime, timezone
    user.last_login = datetime.now(timezone.utc)
    await db.flush()

    # Create token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": str(user.id)
    }

from fastapi import BackgroundTasks

@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Standardize email
    email = user_in.email.strip().lower()

    # Check if user exists
    result = await db.execute(select(User).where(func.lower(User.email) == email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    # Create user
    user = User(
        email=email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        role=UserRole(user_in.role)
    )
    db.add(user)
    await db.flush()  # flush to get user.id without committing yet

    # Create student profile in the same transaction
    if user.role == UserRole.student:
        from app.models.student_profile import StudentProfile
        profile = StudentProfile(user_id=user.id)
        db.add(profile)

    # Note: db.commit() is intentionally omitted here.
    # The get_db() dependency in database.py will commit the session
    # after this endpoint returns successfully, avoiding a double-commit.
    await db.flush()  # ensure profile gets an id too
    
    # Send confirmation email (non-blocking)
    from app.services.email import send_confirmation_email
    background_tasks.add_task(send_confirmation_email, user.email, user.full_name)
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
