import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.models.facebook_profile import FacebookProfile
from app.db.session import SessionLocal

# Directly define mock data for 50 profiles
FACEBOOK_PROFILE_NAMES = [
    "Alice FB",
    "Bob FB",
    "Charlie FB",
    "Diana FB",
    "Ethan FB",
    "Fiona FB",
    "George FB",
    "Hannah FB",
    "Ian FB",
    "Julia FB",
    "Kevin FB",
    "Laura FB",
    "Mike FB",
    "Nina FB",
    "Oscar FB",
    "Paul FB",
    "Quincy FB",
    "Rachel FB",
    "Sam FB",
    "Tina FB",
    "Uma FB",
    "Victor FB",
    "Wendy FB",
    "Xander FB",
    "Yara FB",
    "Zane FB",
    "Amy FB",
    "Brian FB",
    "Cathy FB",
    "David FB",
    "Ella FB",
    "Frank FB",
    "Grace FB",
    "Henry FB",
    "Isabel FB",
    "Jack FB",
    "Kara FB",
    "Liam FB",
    "Mona FB",
    "Nate FB",
    "Olga FB",
    "Pete FB",
    "Queen FB",
    "Rita FB",
    "Steve FB",
    "Tracy FB",
    "Ursula FB",
    "Vince FB",
    "Will FB",
    "Zoe FB",
]
PROFILE_PICTURES = [f"https://example.com/profile_pic_{i+1}.jpg" for i in range(50)]
PROFILE_TYPES = ["page" if i % 2 == 0 else "user" for i in range(50)]


def main():
    db = SessionLocal()
    try:
        for i in range(50):
            facebook_id = f"fbid{i+1}"
            name = FACEBOOK_PROFILE_NAMES[i]
            type_ = PROFILE_TYPES[i]
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
        print("50 facebook profiles seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
