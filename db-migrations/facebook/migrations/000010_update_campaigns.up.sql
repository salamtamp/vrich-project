BEGIN;

ALTER TABLE campaigns ADD COLUMN description TEXT;
ALTER TABLE campaigns ADD COLUMN start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN end_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN channels TEXT[] DEFAULT NULL;
ALTER TABLE campaigns ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

ALTER TABLE campaigns ALTER COLUMN name TYPE TEXT;
ALTER TABLE campaigns ALTER COLUMN status TYPE TEXT;
ALTER TABLE campaigns ALTER COLUMN created_at TYPE TIMESTAMP;
ALTER TABLE campaigns ALTER COLUMN updated_at TYPE TIMESTAMP;

ALTER TABLE campaigns DROP COLUMN IF EXISTS start_at;
ALTER TABLE campaigns DROP COLUMN IF EXISTS end_at;

ALTER TABLE campaigns ADD CONSTRAINT campaigns_name_unique UNIQUE (name);
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('active', 'inactive'));
ALTER TABLE campaigns ADD CONSTRAINT campaigns_channel_check CHECK (channels IS NULL OR channels <@ ARRAY['facebook_comment','facebook_inbox']);

COMMIT; 