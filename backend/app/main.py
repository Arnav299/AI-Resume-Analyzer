# =============================================================================
# backend/app/main.py — FastAPI Application Entry Point
# =============================================================================
import sys
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import get_settings
from app.core.database import engine
from app.routers import api_router

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all database tables on startup and seed demo accounts."""
    from app.models import Base
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connected successfully.")
    except Exception as e:
        logger.error(f"Failed to connect to the database. Ensure the database is accessible. Error: {e}")
        sys.exit(1)

    # Seed demo accounts so the Quick-Fill buttons work out of the box
    await _seed_demo_accounts()

    yield
    # Shutdown: dispose engine connections
    await engine.dispose()


async def _seed_demo_accounts():
    """Create demo recruiter and student accounts if they don't exist."""
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User, UserRole

    DEMO_ACCOUNTS = [
        {"email": "recruiter@rocas.ai",  "full_name": "Demo Recruiter",  "password": "recruiter123",  "role": UserRole.recruiter},
        {"email": "student@rocas.ai",    "full_name": "Demo Student",     "password": "student123",    "role": UserRole.student},
    ]

    try:
        async with AsyncSessionLocal() as db:
            for acc in DEMO_ACCOUNTS:
                result = await db.execute(select(User).where(User.email == acc["email"]))
                user = result.scalar_one_or_none()
                if user is None:
                    user = User(
                        email=acc["email"],
                        full_name=acc["full_name"],
                        password_hash=get_password_hash(acc["password"]),
                        role=acc["role"],
                        is_active=True,
                    )
                    db.add(user)
                    await db.flush() # ensure user.id is generated
                
                # Ensure StudentProfile exists for student users
                if user.role == UserRole.student:
                    from app.models.student_profile import StudentProfile
                    sp_result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
                    if sp_result.scalar_one_or_none() is None:
                        sp = StudentProfile(user_id=user.id)
                        db.add(sp)

            await db.commit()
            print("[startup] Demo accounts seeded (recruiter@rocas.ai / student@rocas.ai)")
    except Exception as e:
        print(f"[startup] Warning: could not seed demo accounts: {e}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# --- Rate Limiting Setup ---
# NOTE: SlowAPIMiddleware MUST be added BEFORE CORSMiddleware.
# Starlette applies middlewares in reverse order (last added = outermost).
# CORSMiddleware needs to be outermost so it can handle OPTIONS preflight
# requests before SlowAPIMiddleware intercepts them with a 405 response.
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS — added last so it becomes the outermost middleware layer
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app_name": settings.APP_NAME, "version": settings.APP_VERSION}


app.include_router(api_router, prefix="/api")

