import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.security import get_password_hash
from app.db.models.user import User
from app.db.session import SessionLocal
from app.seeds.constants import USER_EMAILS, USER_NAMES


def main():
    db = SessionLocal()
    try:
        for i in range(15):
            email = USER_EMAILS[i]
            name = USER_NAMES[i]
            password = get_password_hash(f"password{i+1}")
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                print(f"User {email} already exists.")
                continue
            user = User(
                email=email,
                name=name,
                password=password,
            )
            db.add(user)
        db.commit()
        print("15 users seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
