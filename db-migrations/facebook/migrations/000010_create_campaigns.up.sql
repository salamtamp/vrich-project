BEGIN;

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL,
    channels TEXT [] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT campaigns_name_unique UNIQUE (name),
    CONSTRAINT campaigns_status_check CHECK (status IN ('active', 'inactive')),
    CONSTRAINT campaigns_channel_check CHECK (
        channels IN ('facebook_comment', 'facebook_inbox')
    )
);

COMMIT;