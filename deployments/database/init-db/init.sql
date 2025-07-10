BEGIN;

CREATE TABLE IF NOT EXISTS facebook_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    facebook_id TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    profile_picture_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_profiles_facebook_id_unique UNIQUE (facebook_id),
    CONSTRAINT facebook_profiles_type_check CHECK (type IN ('page', 'user'))
);

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

CREATE TABLE IF NOT EXISTS facebook_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    post_id UUID NOT NULL,
    comment_id TEXT NOT NULL,
    message TEXT,
    "type" TEXT NOT NULL,
    link TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_comments_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_comments_comment_id_unique UNIQUE (comment_id),
    CONSTRAINT facebook_comments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE,
    CONSTRAINT facebook_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES facebook_posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS facebook_inboxes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    messenger_id TEXT NOT NULL,
    message TEXT,
    "type" TEXT NOT NULL,
    link TEXT,
    media_url TEXT NULL,
    media_type TEXT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_inboxes_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_inboxes_messenger_id_unique UNIQUE (messenger_id),
    CONSTRAINT facebook_inboxes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email)
);

COMMIT;