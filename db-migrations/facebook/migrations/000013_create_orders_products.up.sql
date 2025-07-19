BEGIN;

CREATE TABLE IF NOT EXISTS orders_products (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    campaign_product_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT orders_products_pkey PRIMARY KEY (id),
    CONSTRAINT orders_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT orders_products_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE,
    CONSTRAINT orders_products_campaign_product_id_fkey FOREIGN KEY (campaign_product_id) REFERENCES campaigns_products(id) ON DELETE CASCADE
);

COMMIT;