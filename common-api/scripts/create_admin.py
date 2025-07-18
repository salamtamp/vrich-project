import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.security import get_password_hash
from app.db.models.user import User
from app.db.session import SessionLocal


def main():
    db = SessionLocal()
    try:
        email = "admin@example.com"
        name = "Admin User"
        password = "adminpass123"

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("Admin user already exists.")
            return

        user = User(
            email=email,
            name=name,
            password=get_password_hash(password),
        )
        db.add(user)
        db.commit()
        print("Admin user created!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
