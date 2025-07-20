import os
from functools import lru_cache

from pydantic_settings import BaseSettings  # type: ignore


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Common API")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    DESCRIPTION: str = os.getenv("DESCRIPTION", "Common API")

    # API
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = os.getenv("PORT", 3001)
    WORKERS: int = os.getenv("API_WORKERS", 1)
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    INTERNAL_WEBHOOK_IPS: str = os.getenv(
        "API_INTERNAL_WEBHOOK_IPS", "127.0.0.1,localhost"
    )
    ALLOWED_HOSTS_RAW: str = os.getenv(
        "API_ALLOWED_HOSTS_RAW", "localhost,127.0.0.1,0.0.0.0"
    )

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "REPLACE_ME")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 86400)
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

    # File Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    MAX_FILE_SIZE: int = os.getenv("MAX_FILE_SIZE", 10485760)
    ALLOWED_EXTENSIONS: str = os.getenv(
        "ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,pdf,doc,docx"
    )

    # Database
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    if ENVIRONMENT in ("test", "testing"):
        DATABASE_URL: str = "sqlite:///./test.db"
    else:
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL", "postgresql://user:password@database:5432/postgres"
        )
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "postgres")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")

    # Redis
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = os.getenv("REDIS_PORT", 6379)
    REDIS_DB: int = os.getenv("REDIS_DB", 0)
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")

    # Admin Configuration
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@example.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "adminpass123")
    ADMIN_FULL_NAME: str = os.getenv("ADMIN_FULL_NAME", "System Administrator")

    # Environment
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"

    # Facebook Scheduler
    FACEBOOK_SCHEDULER_BASE_URL: str = os.getenv(
        "FACEBOOK_SCHEDULER_BASE_URL", "http://localhost:3002"
    )

    @property
    def allowed_hosts(self) -> list[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS_RAW.split(",")]

    @property
    def allowed_internal_webhook_ips(self) -> set[str]:
        return {ip.strip() for ip in self.INTERNAL_WEBHOOK_IPS.split(",") if ip.strip()}

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
