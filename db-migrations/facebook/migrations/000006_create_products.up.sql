BEGIN;

CREATE TABLE IF NOT EXISTS products (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INT DEFAULT 0,
    unit TEXT,
    full_price NUMERIC(12, 2) DEFAULT 0,
    selling_price NUMERIC(12, 2) DEFAULT 0,
    cost NUMERIC(12, 2) DEFAULT 0,
    profit NUMERIC(12, 2) GENERATED ALWAYS AS (selling_price - cost) STORED,
    shipping_fee NUMERIC(12, 2) DEFAULT 0,
    note TEXT,
    keyword TEXT,
    product_category TEXT,
    product_type TEXT,
    color TEXT,
    size TEXT,
    weight NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_code_unique UNIQUE (code),
    CONSTRAINT products_quantity_positive CHECK (quantity >= 0),
    CONSTRAINT products_full_price_positive CHECK (full_price >= 0),
    CONSTRAINT products_selling_price_positive CHECK (selling_price >= 0),
    CONSTRAINT products_cost_positive CHECK (cost >= 0),
    CONSTRAINT products_shipping_fee_positive CHECK (shipping_fee >= 0),
    CONSTRAINT products_weight_positive CHECK (weight >= 0)
);

COMMIT;