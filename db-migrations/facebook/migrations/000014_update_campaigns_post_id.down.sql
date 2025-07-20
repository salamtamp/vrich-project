BEGIN;

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_products_post_id_fkey;
ALTER TABLE campaigns DROP COLUMN IF EXISTS post_id;

COMMIT; 