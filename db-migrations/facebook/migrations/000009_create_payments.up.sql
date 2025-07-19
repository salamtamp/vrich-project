BEGIN;

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    order_id UUID NOT NULL,
    payment_code TEXT NOT NULL,
    payment_slip TEXT,
    payment_date TIMESTAMP NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    refund_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT payments_payment_code_unique UNIQUE (payment_code),
    CONSTRAINT payments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT payments_refund_id_fkey FOREIGN KEY (refund_id) REFERENCES payments(id) ON DELETE CASCADE,
    CONSTRAINT payments_status_check CHECK (
        status IN (
            'pending',
            'completed',
            'failed',
            'refunded'
        )
    ),
    CONSTRAINT payments_method_check CHECK (
        method IN (
            'bank_transfer',
            'cash',
            'other'
        )
    )
);

COMMIT;