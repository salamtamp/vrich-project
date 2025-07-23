BEGIN;

ALTER TABLE orders ADD CONSTRAINT unique_profile_campaign UNIQUE (profile_id, campaign_id);

ALTER TABLE orders ALTER COLUMN purchase_date DROP NOT NULL;

CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    prefix TEXT := 'ORD';
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 8-character random code
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random()*length(chars) + 1)::int, 1);
        END LOOP;

        result := prefix || result;

        -- Check uniqueness
        SELECT EXISTS (SELECT 1 FROM orders WHERE code = result) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE orders ALTER COLUMN code SET DEFAULT generate_order_code();

COMMIT;