# =============================================================================
# backend/app/core/config.py — Application settings via pydantic-settings
# =============================================================================
from pydantic_settings import BaseSettings
from functools import lru_cache


from pathlib import Path
_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_DEFAULT_DB_PATH = (_BASE_DIR / "resume_analyzer.db").as_posix()
_DEFAULT_UPLOAD_DIR = str(_BASE_DIR / "uploads" / "resumes")

class Settings(BaseSettings):
    """Application configuration loaded from environment variables / .env file."""

    # App
    APP_NAME: str = "AI Resume Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{_DEFAULT_DB_PATH}"
    DATABASE_ECHO: bool = False

    # JWT Auth
    JWT_SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # File uploads
    UPLOAD_DIR: str = _DEFAULT_UPLOAD_DIR
    MAX_UPLOAD_SIZE_MB: int = 10

    # Gemini API Key
    GEMINI_API_KEY: str | None = None

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Email config
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "no-reply@rocas.ai"
    SMTP_FROM_NAME: str = "AI Resume Analyzer"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
