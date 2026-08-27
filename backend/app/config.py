from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "EduConnect API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/educonnect"
    cors_origins: str = "http://localhost:5173"
    jwt_secret: str = "development-only-change-me"
    access_token_minutes: int = 30
    refresh_token_days: int = 7
    # OpenAI is intentionally disabled for now. Groq powers roadmap generation.
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    upload_dir: str = "uploads/resumes"
    max_resume_size_mb: int = 5

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
