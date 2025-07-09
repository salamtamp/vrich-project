from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.models.facebook_comment import FacebookComment
from app.db.models.facebook_inbox import FacebookInbox
from app.db.models.facebook_post import FacebookPost
from app.db.session import get_db
from app.schemas.facebook_comment import FacebookComment as FacebookCommentSchema
from app.schemas.facebook_messenger import FacebookInbox as FacebookInboxSchema
from app.schemas.facebook_post import FacebookPost as FacebookPostSchema

router = APIRouter()


@router.get("/latest", summary="Get latest notifications for each type")
def get_latest_notifications(db: Session = Depends(get_db)):
    posts = (
        db.query(FacebookPost).order_by(FacebookPost.created_at.desc()).limit(1).all()
    )
    messages = (
        db.query(FacebookInbox).order_by(FacebookInbox.created_at.desc()).limit(1).all()
    )
    comments = (
        db.query(FacebookComment)
        .order_by(FacebookComment.created_at.desc())
        .limit(1)
        .all()
    )
    return {
        "posts": [FacebookPostSchema.model_validate(p) for p in posts],
        "messages": [FacebookInboxSchema.model_validate(m) for m in messages],
        "comments": [FacebookCommentSchema.model_validate(c) for c in comments],
    }
