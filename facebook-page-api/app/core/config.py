from functools import lru_cache
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Facebook Page API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Facebook Page API"

    # Facebook
    FACEBOOK_BASE_URL: str
    FACEBOOK_PAGE_ACCESS_TOKEN: str
    FACEBOOK_INBOX_VERIFY_TOKEN: str

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


settings = get_settings()
