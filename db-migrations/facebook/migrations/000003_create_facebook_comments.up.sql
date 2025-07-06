BEGIN;

CREATE TABLE IF NOT EXISTS facebook_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    post_id UUID NOT NULL,
    comment_id TEXT NOT NULL,
    message TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_comments_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_comments_comment_id_unique UNIQUE (comment_id),
    CONSTRAINT facebook_comments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE,
    CONSTRAINT facebook_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES facebook_posts(id) ON DELETE CASCADE
);

COMMIT;