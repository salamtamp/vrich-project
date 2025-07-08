from functools import lru_cache
from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from app.utils.queue import Queue

import os

queue: Queue = None

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Facebook Page API")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    DESCRIPTION: str = os.getenv("DESCRIPTION", "Facebook Page API")

    # API
    API_PORT: int = os.getenv("API_PORT", 8000)
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")

    # Facebook
    FACEBOOK_BASE_URL: str = os.getenv("FACEBOOK_BASE_URL", "https://graph.facebook.com/v23.0")
    FACEBOOK_PAGE_ACCESS_TOKEN: str = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN")
    FACEBOOK_INBOX_VERIFY_TOKEN: str = os.getenv("FACEBOOK_INBOX_VERIFY_TOKEN")

    # RabbitMQ
    RABBITMQ_HOST: str = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT: int = os.getenv("RABBITMQ_PORT", 15672)
    RABBITMQ_USER: str = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASS: str = os.getenv("RABBITMQ_PASS", "guest")

    # Scheduler
    SCHEDULER_ENABLED: bool = os.getenv("SCHEDULER_ENABLED", "True") == "True"
    SCHEDULER_TIMEZONE: str = os.getenv("SCHEDULER_TIMEZONE", "UTC")
    SCHEDULER_MAX_INSTANCES: int = os.getenv("SCHEDULER_MAX_INSTANCES", 3)
    SCHEDULER_COALESCE: bool = os.getenv("SCHEDULER_COALESCE", "False") == "True"
    SCHEDULER_MISFIRE_GRACE_TIME: int = os.getenv("SCHEDULER_MISFIRE_GRACE_TIME", 300)
    SCHEDULER_THREAD_POOL_SIZE: int = os.getenv("SCHEDULER_THREAD_POOL_SIZE", 20)

    # Facebook Posts Scheduler
    FACEBOOK_POSTS_CRON_SCHEDULE: str = os.getenv("FACEBOOK_POSTS_CRON_SCHEDULE", "0 * * * *")
    FACEBOOK_POSTS_ENABLED: bool = os.getenv("FACEBOOK_POSTS_ENABLED", "True") == "True"

    # Facebook Comments Scheduler
    FACEBOOK_COMMENTS_CRON_SCHEDULE: str = os.getenv("FACEBOOK_COMMENTS_CRON_SCHEDULE", "*/5 * * * *")
    FACEBOOK_COMMENTS_ENABLED: bool = os.getenv("FACEBOOK_COMMENTS_ENABLED", "True") == "True"

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
        host=settings.RABBITMQ_HOST,
        username=settings.RABBITMQ_USER,
        password=settings.RABBITMQ_PASS
    )
    queue.connect()

def get_queue() -> Queue:
    return queue

settings = get_settings()
queue = get_queue()
