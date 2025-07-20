import uuid
from unittest.mock import Mock

import pytest
import sqlalchemy
import sqlalchemy.dialects.postgresql
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import CHAR, JSON

# Patch PostgreSQL types for SQLite before any model imports
if "sqlite" in str(__import__("os").environ.get("DATABASE_URL", "sqlite:///./test.db")):
    # Patch ARRAY to use JSON for SQLite
    sqlalchemy.dialects.postgresql.ARRAY = JSON

    class SQLiteUUID(CHAR):
        def __init__(self, *args, **kwargs):
            super().__init__(length=36)

        def bind_processor(self, dialect):
            def process(value):
                if value is None:
                    return value
                if not isinstance(value, str):
                    return str(value)
                return value

            return process

        def result_processor(self, dialect, coltype):
            def process(value):
                if value is None:
                    return value
                return uuid.UUID(value)

            return process

    sqlalchemy.dialects.postgresql.UUID = SQLiteUUID

import app.db.models
from app.core.config import settings  # noqa: F401
from app.db.session import Base, get_db
from app.main import app, socket_app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Patch JSONB for SQLite
if engine.url.get_backend_name() == "sqlite":
    # Patch JSONB to use JSON or Text for SQLite
    sqlalchemy.dialects.postgresql.JSONB = JSON
    # If you want to fallback to Text instead, use: JSONB = Text

    if "sqlite" in str(engine.url):

        class SQLiteUUID(CHAR):
            def __init__(self, *args, **kwargs):
                super().__init__(length=36)

            def bind_processor(self, dialect):
                def process(value):
                    if value is None:
                        return value
                    if not isinstance(value, str):
                        return str(value)
                    return value

                return process

            def result_processor(self, dialect, coltype):
                def process(value):
                    if value is None:
                        return value
                    return uuid.UUID(value)

                return process

        sqlalchemy.dialects.postgresql.UUID = SQLiteUUID

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# Add a session-scoped fixture for DB schema setup/teardown
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():

    Base.metadata.create_all(bind=engine)
    yield TestClient(socket_app)
    Base.metadata.drop_all(bind=engine)


# Function-scoped, autouse fixture to truncate all tables before each test
@pytest.fixture(autouse=True)
def clean_db():
    inspector = inspect(engine)
    with engine.connect() as conn:
        for table_name in inspector.get_table_names():
            conn.execute(text(f'DELETE FROM "{table_name}"'))
        conn.commit()


@pytest.fixture
def db():
    db = TestingSessionLocal()
    db.execute(text("PRAGMA foreign_keys=ON"))
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def mock_redis():
    return Mock()


@pytest.fixture
def mock_external_api():
    return Mock()


@pytest.fixture
def authenticated_client(client, db):
    # Create test user and get token
    user_data = {"email": "test@example.com", "password": "testpass123"}
    response = client.post("/api/v1/auth/login", data=user_data)
    token = response.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client


@pytest.fixture
def facebook_profile_fixture(db):
    from uuid import uuid4

    from app.db.repositories.facebook_profile.repo import facebook_profile_repo
    from app.schemas.facebook_profile import FacebookProfileCreate

    profile_in = FacebookProfileCreate(
        facebook_id=f"fb_{uuid4()}",
        type="user",
        name="Test User",
        picture_url="http://example.com/pic.jpg",
        access_token="token",
        page_id=f"page_{uuid4()}",
    )
    return facebook_profile_repo.create(db, obj_in=profile_in)
