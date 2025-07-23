BEGIN;

ALTER TABLE orders_products DROP CONSTRAINT unique_order_product;

COMMIT;