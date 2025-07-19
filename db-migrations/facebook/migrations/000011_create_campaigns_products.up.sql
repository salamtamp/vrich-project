BEGIN;

CREATE TABLE IF NOT EXISTS campaigns_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    product_id UUID NOT NULL,
    keyword TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    max_order_quantity INT DEFAULT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT campaigns_products_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT campaigns_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT campaigns_products_status_check CHECK (status IN ('active', 'inactive'))
);

COMMIT;