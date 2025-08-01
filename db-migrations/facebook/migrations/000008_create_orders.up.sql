BEGIN;

CREATE TABLE IF NOT EXISTS orders (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    profile_id UUID NOT NULL,
    campaign_id UUID NOT NULL,
    status TEXT NOT NULL,
    purchase_date TIMESTAMP,
    shipping_date TIMESTAMP,
    delivery_date TIMESTAMP,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_code_unique UNIQUE (code),
    CONSTRAINT orders_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE,
    CONSTRAINT orders_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT orders_status_check CHECK (
        status IN (
            'pending',
            'confirmed',
            'paid',
            'approved',
            'shipped',
            'delivered',
            'cancelled',
            'completed'
        )
    )
);

COMMIT;