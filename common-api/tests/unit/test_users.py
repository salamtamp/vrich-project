import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.db.models
from app.core.security import create_access_token, get_password_hash
from app.db.models.user import User
from app.db.repositories import user  # noqa: F401
from app.db.session import Base, get_db
from app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override the get_db dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db_session: Session):
    """Create a test user"""
    user = User(  # noqa: F811
        email="testuser@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("testpass123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User):
    """Create authentication headers for test user"""
    access_token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {access_token}"}


def test_create_user_public(db_session):
    """Test creating a user via public registration endpoint"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "full_name": "New User",
            "password": "newpass123",
        },
    )
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"
    assert response.json()["username"] == "newuser"
    assert "password" not in response.json()


def test_create_user_unauthorized(db_session: Session):
    """Test creating a user without authentication fails"""
    response = client.post(
        "/api/v1/users/",
        json={
            "email": "unauthorized@example.com",
            "username": "unauthorized",
            "full_name": "Unauthorized User",
            "password": "testpass123",
        },
    )
    assert response.status_code == 401


def test_read_users_authenticated(db_session: Session, auth_headers: dict):
    """Test reading users with authentication"""
    response = client.get("/api/v1/users/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_users_unauthorized(db_session: Session):
    """Test reading users without authentication fails"""
    response = client.get("/api/v1/users/")
    assert response.status_code == 401


def test_get_current_user(db_session: Session, auth_headers: dict):
    """Test getting current user info"""
    response = client.get("/api/v1/users/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_update_user_profile(db_session: Session, auth_headers: dict):
    """Test updating user profile"""
    response = client.put(
        "/api/v1/users/me",
        json={
            "full_name": "Updated Test User",
            "email": "updated@example.com",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Test User"


def test_login_user(db_session: Session, test_user: User):
    """Test user login"""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user.username,
            "password": "testpass123",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_credentials(db_session: Session):
    """Test login with invalid credentials"""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent",
            "password": "wrongpassword",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401


def test_health_check():
    """Test health check endpoint (should be public)"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_user_validation_errors(db_session: Session):
    """Test user creation with validation errors"""

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalidemail",
            "username": "testuser",
            "password": "testpass123",
        },
    )
    assert response.status_code == 422

    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
        },
    )
    assert response.status_code == 422


def test_duplicate_user_creation(db_session: Session, test_user: User):
    """Test creating user with duplicate email/username"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user.email,
            "username": "differentusername",
            "password": "testpass123",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


@pytest.fixture(autouse=True)
def cleanup_db():
    """Clean up database after each test"""
    yield

    engine.dispose()
