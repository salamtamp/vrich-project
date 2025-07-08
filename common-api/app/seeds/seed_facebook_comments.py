import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.db.models.facebook_comment import FacebookComment
from app.db.models.facebook_post import FacebookPost
from app.db.models.facebook_profile import FacebookProfile
from app.db.session import SessionLocal

# Directly define mock data for 50 comment messages
COMMENT_MESSAGES = [f"Mock comment message {i+1}" for i in range(50)]


def main():
    db = SessionLocal()
    try:
        profiles = db.query(FacebookProfile).all()
        posts = db.query(FacebookPost).all()
        if len(profiles) < 50 or len(posts) < 50:
            print("Not enough facebook profiles or posts to seed comments.")
            return
        for i in range(50):
            comment_id = f"commentid{i+1}"
            profile_id = profiles[i % len(profiles)].id
            post_id = posts[i % len(posts)].id
            message = COMMENT_MESSAGES[i]
            published_at = datetime.now() - timedelta(minutes=i)
            existing = (
                db.query(FacebookComment)
                .filter(FacebookComment.comment_id == comment_id)
                .first()
            )
            if existing:
                print(f"FacebookComment {comment_id} already exists.")
                continue
            comment = FacebookComment(
                profile_id=profile_id,
                post_id=post_id,
                comment_id=comment_id,
                message=message,
                published_at=published_at,
            )
            db.add(comment)
        db.commit()
        print("50 facebook comments seeded!")
    finally:
        db.close()


if __name__ == "__main__":
    main()
