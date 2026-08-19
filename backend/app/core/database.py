# =============================================================================
# backend/app/core/database.py — SQLAlchemy async engine + session factory
# =============================================================================
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator

from .config import get_settings

settings = get_settings()

# SQLite doesn't support pool_size/max_overflow — use conditional kwargs
_engine_kwargs = {"echo": settings.DATABASE_ECHO}
if not settings.DATABASE_URL.startswith("sqlite"):
    _engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
    })

engine = create_async_engine(
    settings.DATABASE_URL,
    **_engine_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
