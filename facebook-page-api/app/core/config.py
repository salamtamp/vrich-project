from functools import lru_cache
from pydantic import ConfigDict
from pydantic_settings import BaseSettings
from app.utils.queue import Queue

queue: Queue = None

class Settings(BaseSettings):
    PROJECT_NAME: str = "Facebook Page API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Facebook Page API"

    # API
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"

    # Facebook
    FACEBOOK_BASE_URL: str
    FACEBOOK_PAGE_ACCESS_TOKEN: str
    FACEBOOK_INBOX_VERIFY_TOKEN: str

    # RabbitMQ
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 15672
    RABBITMQ_USER: str = "guest"
    RABBITMQ_PASS: str = "guest"

    # Env
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

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
