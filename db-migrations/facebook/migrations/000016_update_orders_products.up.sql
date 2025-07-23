BEGIN;

ALTER TABLE orders_products ADD CONSTRAINT unique_order_product UNIQUE (order_id, profile_id, campaign_product_id);

COMMIT;