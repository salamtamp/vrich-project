BEGIN;

CREATE TABLE IF NOT EXISTS facebook_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    post_id TEXT NOT NULL,
    "message" TEXT,
    "type" TEXT NULL,
    link TEXT,
    media_url TEXT NULL,
    media_type TEXT NULL,
    "status" TEXT NULL,
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_posts_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_posts_post_id_unique UNIQUE (post_id),
    CONSTRAINT facebook_posts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE,
    CONSTRAINT facebook_posts_status_check CHECK (status IN ('active', 'inactive')),
    CONSTRAINT facebook_posts_media_type_check CHECK (media_type IN ('image', 'video')),
    CONSTRAINT facebook_posts_type_check CHECK (type IN ('text', 'image', 'video'))
);

COMMIT;