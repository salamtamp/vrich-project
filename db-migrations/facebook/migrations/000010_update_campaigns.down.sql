BEGIN;

-- Remove constraints
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_name_unique;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_channel_check;

-- Revert column types
ALTER TABLE campaigns ALTER COLUMN name TYPE VARCHAR;
ALTER TABLE campaigns ALTER COLUMN status TYPE VARCHAR;
ALTER TABLE campaigns ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE campaigns ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Drop new columns
ALTER TABLE campaigns DROP COLUMN IF EXISTS description;
ALTER TABLE campaigns DROP COLUMN IF EXISTS start_date;
ALTER TABLE campaigns DROP COLUMN IF EXISTS end_date;
ALTER TABLE campaigns DROP COLUMN IF EXISTS channels;
ALTER TABLE campaigns DROP COLUMN IF EXISTS deleted_at;

-- Restore old columns
ALTER TABLE campaigns ADD COLUMN start_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN end_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

COMMIT; 