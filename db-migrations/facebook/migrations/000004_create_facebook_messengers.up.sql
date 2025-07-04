BEGIN;

CREATE TABLE IF NOT EXISTS facebook_messengers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    messenger_id TEXT NOT NULL,
    "message" TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT facebook_messengers_pkey PRIMARY KEY (id),
    CONSTRAINT facebook_messengers_messenger_id_unique UNIQUE (messenger_id),
    CONSTRAINT facebook_messengers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE
);

COMMIT;