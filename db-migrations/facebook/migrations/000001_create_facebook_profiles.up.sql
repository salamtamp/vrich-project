BEGIN;

CREATE TABLE IF NOT EXISTS facebook_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    facebook_id TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    profile_picture_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_profiles_facebook_id_unique UNIQUE (facebook_id),
    CONSTRAINT facebook_profiles_type_check CHECK (type IN ('page', 'user'))
);

COMMIT;