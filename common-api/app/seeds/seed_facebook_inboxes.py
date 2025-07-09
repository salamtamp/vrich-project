import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.models.facebook_inbox import FacebookInbox
from app.db.models.facebook_profile import FacebookProfile
from app.db.session import SessionLocal

# Directly define mock data for 50 inbox messages
INBOX_MESSAGES = [f"Mock inbox message {i+1}" for i in range(50)]


def main():
    db = SessionLocal()
    try:
        profiles = db.query(FacebookProfile).all()
        if len(profiles) < 50:
            print("Not enough facebook profiles to seed inboxes.")
            return
        for i in range(50):
            messenger_id = f"msgid{i+1}"
            profile_id = profiles[i % len(profiles)].id
            message = INBOX_MESSAGES[i]
            published_at = datetime.now() - timedelta(hours=i)
            existing = (
                db.query(FacebookInbox)
                .filter(FacebookInbox.messenger_id == messenger_id)
                .first()
            )
            if existing:
                print(f"FacebookInbox {messenger_id} already exists.")
                continue
            inbox = FacebookInbox(
                profile_id=profile_id,
                messenger_id=messenger_id,
                message=message,
                type="text",
                link=None,
                published_at=published_at,
            )
            db.add(inbox)
        db.commit()
        print("50 facebook inboxes seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
