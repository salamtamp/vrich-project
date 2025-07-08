import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.models.facebook_messenger import FacebookMessenger
from app.db.models.facebook_profile import FacebookProfile
from app.db.session import SessionLocal

# Directly define mock data for 50 messenger messages
MESSENGER_MESSAGES = [f"Mock messenger message {i+1}" for i in range(50)]


def main():
    db = SessionLocal()
    try:
        profiles = db.query(FacebookProfile).all()
        if len(profiles) < 50:
            print("Not enough facebook profiles to seed messengers.")
            return
        for i in range(50):
            messenger_id = f"msgid{i+1}"
            profile_id = profiles[i % len(profiles)].id
            message = MESSENGER_MESSAGES[i]
            sent_at = datetime.now() - timedelta(hours=i)
            existing = (
                db.query(FacebookMessenger)
                .filter(FacebookMessenger.messenger_id == messenger_id)
                .first()
            )
            if existing:
                print(f"FacebookMessenger {messenger_id} already exists.")
                continue
            messenger = FacebookMessenger(
                profile_id=profile_id,
                messenger_id=messenger_id,
                message=message,
                sent_at=sent_at,
            )
            db.add(messenger)
        db.commit()
        print("50 facebook messengers seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
