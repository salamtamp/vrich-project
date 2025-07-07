from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.facebook_comment import FacebookComment
from app.db.models.facebook_post import FacebookPost
from app.db.models.facebook_profile import FacebookProfile
from app.db.repositories.facebook_comment.repo import facebook_comment_repo
from app.schemas.facebook_comment import FacebookCommentCreate, FacebookCommentUpdate


@pytest.fixture
def profile(db):
    profile = FacebookProfile(
        id=uuid4(),
        facebook_id="fbid-123",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    db.add(profile)
    db.commit()
    return profile


@pytest.fixture
def post(db, profile):
    post = FacebookPost(
        id=uuid4(),
        profile_id=profile.id,
        post_id="post-123",
        message="Test post",
        link=None,
        media_url=None,
        media_type=None,
        status="active",
        published_at=datetime.now(UTC),
    )
    db.add(post)
    db.commit()
    return post


@pytest.fixture
def facebook_comment_data(profile, post):
    return {
        "profile_id": profile.id,
        "post_id": post.id,
        "comment_id": "comment-123",
        "message": "Test comment message",
        "published_at": datetime.now(UTC),
    }


def test_create_facebook_comment(db, facebook_comment_data):
    comment = facebook_comment_repo.create(
        db, FacebookCommentCreate(**facebook_comment_data)
    )
    assert comment.comment_id == facebook_comment_data["comment_id"]
    assert comment.profile_id == facebook_comment_data["profile_id"]
    assert comment.post_id == facebook_comment_data["post_id"]
    assert comment.id is not None


def test_get_by_comment_id(db, facebook_comment_data):
    created = facebook_comment_repo.create(
        db, FacebookCommentCreate(**facebook_comment_data)
    )
    found = facebook_comment_repo.get_by_comment_id(
        db, comment_id=facebook_comment_data["comment_id"]
    )
    assert found is not None
    assert found.id == created.id


def test_update_facebook_comment(db, facebook_comment_data):
    created = facebook_comment_repo.create(
        db, FacebookCommentCreate(**facebook_comment_data)
    )
    update_data = FacebookCommentUpdate(message="Updated comment message")
    updated = facebook_comment_repo.update(db, created, update_data)
    assert updated.message == "Updated comment message"


def test_unique_comment_id(db, facebook_comment_data):
    facebook_comment_repo.create(db, FacebookCommentCreate(**facebook_comment_data))
    with pytest.raises(ValueError):
        facebook_comment_repo.create(db, FacebookCommentCreate(**facebook_comment_data))


def test_foreign_key_profile_id(db, post):
    data = {
        "profile_id": uuid4(),  # Non-existent profile
        "post_id": post.id,
        "comment_id": "comment-fk-profile",
        "message": "Should fail",
        "published_at": datetime.now(UTC),
    }
    with pytest.raises(ValueError):
        facebook_comment_repo.create(db, FacebookCommentCreate(**data))


def test_foreign_key_post_id(db, profile):
    data = {
        "profile_id": profile.id,
        "post_id": uuid4(),  # Non-existent post
        "comment_id": "comment-fk-post",
        "message": "Should fail",
        "published_at": datetime.now(UTC),
    }
    with pytest.raises(ValueError):
        facebook_comment_repo.create(db, FacebookCommentCreate(**data))


def seed_comments(db, profile, post, count=5):
    comments = []
    for i in range(count):
        comment_in = FacebookCommentCreate(
            profile_id=profile.id,
            post_id=post.id,
            comment_id=f"comment-{i}",
            message=f"Message {i}",
            published_at=datetime.now(UTC) - timedelta(minutes=i),
        )
        comment = facebook_comment_repo.create(db, obj_in=comment_in)
        comments.append(comment)
    return comments


def test_pagination_limit_offset(db, profile, post):
    seed_comments(db, profile, post, count=10)
    builder = PaginationBuilder(FacebookComment, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False

    result2 = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=5
    )
    assert result2.limit == 5
    assert result2.offset == 5
    assert len(result2.docs) == 5
    assert result2.total == 10
    assert result2.has_next is False
    assert result2.has_prev is True


def test_pagination_ordering(db, profile, post):
    seed_comments(db, profile, post, count=3)
    builder = PaginationBuilder(FacebookComment, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(limit=3)
    created_ats = [doc["created_at"] for doc in result.docs]
    assert created_ats == sorted(created_ats, reverse=True)

    result2 = builder.order_by("created_at", OrderDirection.ASC).paginate(limit=3)
    created_ats_asc = [doc["created_at"] for doc in result2.docs]
    assert created_ats_asc == sorted(created_ats_asc)


def test_pagination_search(db, profile, post):
    seed_comments(db, profile, post, count=5)
    unique_message = "SpecialSearchMessage"
    comment_in = FacebookCommentCreate(
        profile_id=profile.id,
        post_id=post.id,
        comment_id="comment-special",
        message=unique_message,
        published_at=datetime.now(UTC),
    )
    facebook_comment_repo.create(db, obj_in=comment_in)
    builder = PaginationBuilder(FacebookComment, db)
    result = builder.search(search=unique_message, search_by="message").paginate()
    assert result.total >= 1
    assert any(unique_message in doc["message"] for doc in result.docs)
