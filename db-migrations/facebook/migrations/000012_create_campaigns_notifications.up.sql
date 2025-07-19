BEGIN;

CREATE TABLE IF NOT EXISTS campaigns_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    order_id UUID NOT NULL,
    message JSONB NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaigns_notifications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT campaigns_notifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES facebook_profiles(id) ON DELETE CASCADE,
    CONSTRAINT campaigns_notifications_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT campaigns_notifications_status_check CHECK (status IN ('success', 'failed'))
);

COMMIT;