BEGIN;

ALTER TABLE orders DROP CONSTRAINT unique_profile_campaign;

ALTER TABLE orders ALTER COLUMN purchase_date SET NOT NULL;

ALTER TABLE orders ALTER COLUMN code DROP DEFAULT;

DROP FUNCTION IF EXISTS generate_order_code();

COMMIT;