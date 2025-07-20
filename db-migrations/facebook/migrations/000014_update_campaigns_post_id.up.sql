BEGIN;

ALTER TABLE campaigns ADD COLUMN post_id UUID;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_products_post_id_fkey FOREIGN KEY (post_id) REFERENCES facebook_posts(id);

COMMIT; 