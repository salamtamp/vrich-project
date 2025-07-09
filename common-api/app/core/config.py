from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Project"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "VRich FastAPI application"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # Env
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # CORS
    ALLOWED_HOSTS_RAW: str = "*"

    # Webhooks
    INTERNAL_WEBHOOK_IPS: str = "127.0.0.1,localhost"

    API_V1_STR: str = "/api/v1"

    POSTGRES_DB: str = "vrich_db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    UPLOAD_DIR: str = "/app/uploads"
    MAX_FILE_SIZE: int = 10485760
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,gif,pdf,doc,docx"
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "adminpass123"
    ADMIN_FULL_NAME: str = "System Administrator"
    REDIS_PASSWORD: str = "redispassword"

    @property
    def allowed_hosts(self) -> list[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS_RAW.split(",")]

    @property
    def internal_webhook_ips(self) -> set[str]:
        return {ip.strip() for ip in self.INTERNAL_WEBHOOK_IPS.split(",") if ip.strip()}

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
