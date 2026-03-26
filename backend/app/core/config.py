from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "AutoPilot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "autopilot"

    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"

    MONITOR_INTERVAL_SECONDS: int = 60

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
