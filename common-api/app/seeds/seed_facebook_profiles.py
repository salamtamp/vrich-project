import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.models.facebook_profile import FacebookProfile
from app.db.session import SessionLocal
from app.seeds.constants import FACEBOOK_PROFILE_NAMES, PROFILE_PICTURES, PROFILE_TYPES


def main():
    db = SessionLocal()
    try:
        for i in range(15):
            facebook_id = f"fbid{i+1}"
            name = FACEBOOK_PROFILE_NAMES[i]
            type_ = PROFILE_TYPES[i % len(PROFILE_TYPES)]
            profile_picture_url = PROFILE_PICTURES[i]
            existing = (
                db.query(FacebookProfile)
                .filter(FacebookProfile.facebook_id == facebook_id)
                .first()
            )
            if existing:
                print(f"FacebookProfile {facebook_id} already exists.")
                continue
            profile = FacebookProfile(
                facebook_id=facebook_id,
                type=type_,
                name=name,
                profile_picture_url=profile_picture_url,
            )
            db.add(profile)
        db.commit()
        print("15 facebook profiles seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
