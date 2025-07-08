import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.models.facebook_post import FacebookPost
from app.db.models.facebook_profile import FacebookProfile
from app.db.session import SessionLocal

# Directly define mock data for 50 posts
POST_MESSAGES = [f"Mock post message {i+1}" for i in range(50)]
POST_STATUSES = ["active" if i % 2 == 0 else "inactive" for i in range(50)]
MEDIA_TYPES = ["image" if i % 2 == 0 else "video" for i in range(50)]


def main():
    db = SessionLocal()
    try:
        profiles = db.query(FacebookProfile).all()
        if len(profiles) < 50:
            print("Not enough facebook profiles to seed posts.")
            return
        for i in range(50):
            post_id = f"postid{i+1}"
            profile_id = profiles[i % len(profiles)].id
            message = POST_MESSAGES[i]
            link = f"https://example.com/post/{i+1}"
            media_url = f"https://example.com/media/{i+1}.jpg"
            media_type = MEDIA_TYPES[i]
            status = POST_STATUSES[i]
            published_at = datetime.now() - timedelta(days=i)
            existing = (
                db.query(FacebookPost)
                .filter(
                    FacebookPost.post_id == post_id,
                    FacebookPost.profile_id == profile_id,
                )
                .first()
            )
            if existing:
                print(
                    f"FacebookPost {post_id} for profile {profile_id} already exists."
                )
                continue
            post = FacebookPost(
                profile_id=profile_id,
                post_id=post_id,
                message=message,
                link=link,
                media_url=media_url,
                media_type=media_type,
                status=status,
                published_at=published_at,
            )
            db.add(post)
        db.commit()
        print("50 facebook posts seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
