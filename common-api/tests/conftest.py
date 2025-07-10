import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock

import app.db.models
from app.core.config import settings  # noqa: F401
from app.db.session import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    import app.db.models

    Base.metadata.create_all(bind=engine)
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():

    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.execute(text("PRAGMA foreign_keys=ON"))
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


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
