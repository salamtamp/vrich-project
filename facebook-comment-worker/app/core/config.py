from functools import lru_cache
from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from app.utils.queue import Queue
from app.utils.database import Database

import os

queue: Queue = None
database: Database = None

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Facebook Comment Worker")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    DESCRIPTION: str = os.getenv("DESCRIPTION", "Facebook Comment Worker")

    # API
    API_PORT: int = os.getenv("API_PORT", 3004)
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")

    # Database
    DATABASE_HOST: str = os.getenv("DATABASE_HOST", "localhost")
    DATABASE_PORT: int = os.getenv("DATABASE_PORT", 5432)
    DATABASE_USER: str = os.getenv("DATABASE_USER", "user")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "password")
    DATABASE_TIMEOUT: int = os.getenv("DATABASE_TIMEOUT", 30)
    DATABASE_SSLMODE: str = os.getenv("DATABASE_SSLMODE", "disable")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "postgres")

    # Queue
    QUEUE_HOST: str = os.getenv("QUEUE_HOST", "localhost")
    QUEUE_PORT: int = os.getenv("QUEUE_PORT", 15672)
    QUEUE_USER: str = os.getenv("QUEUE_USER", "guest")
    QUEUE_PASS: str = os.getenv("QUEUE_PASS", "guest")
    QUEUE_NAME: str = os.getenv("QUEUE_NAME", "facebook_comments")

    # Web
    WEB_HOST: str = os.getenv("WEB_HOST", "localhost")
    WEB_PORT: int = os.getenv("WEB_PORT", 3000)

    # Webhook
    WEBHOOK_HOST: str = os.getenv("WEBHOOK_HOST", "localhost")
    WEBHOOK_PORT: int = os.getenv("WEBHOOK_PORT", 3001)

    # Facebook Page API
    FACEBOOK_PAGE_API_HOST: str = os.getenv("FACEBOOK_PAGE_API_HOST", "localhost")
    FACEBOOK_PAGE_API_PORT: int = os.getenv("FACEBOOK_PAGE_API_PORT", 3002)

    # Env
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

def connect_queue(settings: Settings):
    queue = Queue(
        host=settings.QUEUE_HOST,
        username=settings.QUEUE_USER,
        password=settings.QUEUE_PASS
    )
    queue.connect()

def get_queue() -> Queue:
    return queue

def connect_database(settings: Settings):
    database = Database(
        host=settings.DATABASE_HOST,
        port=settings.DATABASE_PORT,
        user=settings.DATABASE_USER,
        password=settings.DATABASE_PASSWORD,
        database=settings.DATABASE_NAME,
    )
    database.connect()

def get_database() -> Database:
    return database

settings = get_settings()