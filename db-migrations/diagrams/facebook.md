# Facebook Database ER Diagram

This diagram represents the database schema for the Facebook integration system.

```mermaid
erDiagram
    facebook_profiles {
        UUID id PK
        TEXT facebook_id UK
        TEXT type
        TEXT name
        TEXT profile_picture_url
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ deleted_at
    }

    facebook_posts {
        UUID id PK
        UUID profile_id FK
        TEXT post_id UK
        TEXT message
        TEXT type
        TEXT link
        TEXT media_url
        TEXT media_type
        TEXT status
        TIMESTAMPTZ published_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ deleted_at
    }

    facebook_comments {
        UUID id PK
        UUID profile_id FK
        UUID post_id FK
        TEXT comment_id UK
        TEXT message
        TEXT type
        TEXT link
        TIMESTAMPTZ published_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ deleted_at
    }

    facebook_inboxes {
        UUID id PK
        UUID profile_id FK
        TEXT messenger_id UK
        TEXT message
        TEXT type
        TEXT link
        TEXT media_url
        TEXT media_type
        TIMESTAMPTZ published_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ deleted_at
    }

    users {
        UUID id PK
        TEXT name
        TEXT email UK
        TEXT password
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ deleted_at
    }

    products {
        UUID id PK
        TEXT code UK
        TEXT name
        TEXT description
        INT quantity
        TEXT unit
        NUMERIC full_price
        NUMERIC selling_price
        NUMERIC cost
        NUMERIC profit
        NUMERIC shipping_fee
        TEXT note
        TEXT keyword
        TEXT product_category
        TEXT product_type
        TEXT color
        TEXT size
        NUMERIC weight
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    profiles_contacts {
        UUID id PK
        UUID profile_id FK
        TEXT first_name
        TEXT last_name
        TEXT email
        TEXT phone
        TEXT address
        TEXT postal_code
        TEXT city
        TEXT country
        TEXT note
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    campaigns {
        UUID id PK
        TEXT name UK
        TEXT description
        TIMESTAMP start_date
        TIMESTAMP end_date
        TEXT status
        TEXT[] channels
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    orders {
        UUID id PK
        TEXT code UK
        UUID profile_id FK
        UUID campaign_id FK
        TEXT status
        TIMESTAMP purchase_date
        TIMESTAMP shipping_date
        TIMESTAMP delivery_date
        TEXT note
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    payments {
        UUID id PK
        UUID profile_id FK
        UUID order_id FK
        TEXT payment_code UK
        TEXT payment_slip
        TIMESTAMP payment_date
        NUMERIC amount
        TEXT method
        TEXT status
        TEXT note
        UUID refund_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    campaigns_products {
        UUID id PK
        UUID campaign_id FK
        UUID product_id FK
        TEXT keyword
        INT quantity
        TEXT status
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    campaigns_notifications {
        UUID id PK
        UUID campaign_id FK
        UUID profile_id FK
        UUID order_id FK
        JSONB message
        TEXT status
        TIMESTAMP created_at
    }

    orders_products {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        INT quantity
        TIMESTAMP created_at
        TIMESTAMP updated_at
        TIMESTAMP deleted_at
    }

    %% Relationships
    facebook_profiles ||--o{ facebook_posts : "has"
    facebook_profiles ||--o{ facebook_comments : "has"
    facebook_profiles ||--o{ facebook_inboxes : "has"
    facebook_profiles ||--o{ profiles_contacts : "has"
    facebook_profiles ||--o{ orders : "places"
    facebook_profiles ||--o{ payments : "makes"

    facebook_posts ||--o{ facebook_comments : "has"

    campaigns ||--o{ campaigns_products : "contains"
    campaigns ||--o{ campaigns_notifications : "sends"
    campaigns ||--o{ orders : "generates"

    products ||--o{ campaigns_products : "included_in"
    products ||--o{ orders_products : "ordered_in"

    orders ||--o{ orders_products : "contains"
    orders ||--o{ payments : "has"
    orders ||--o{ campaigns_notifications : "notified_about"

    payments ||--o{ payments : "refunds"
```

## Table Descriptions

### Core Facebook Tables
- **facebook_profiles**: Stores Facebook page and user profiles
- **facebook_posts**: Facebook posts from profiles
- **facebook_comments**: Comments on Facebook posts
- **facebook_inboxes**: Facebook Messenger inbox messages

### Business Logic Tables
- **users**: System users for authentication
- **products**: Product catalog with pricing and inventory
- **profiles_contacts**: Contact information for Facebook profiles
- **campaigns**: Marketing campaigns
- **orders**: Customer orders
- **payments**: Payment transactions
- **campaigns_products**: Many-to-many relationship between campaigns and products
- **campaigns_notifications**: Notifications sent for campaigns
- **orders_products**: Many-to-many relationship between orders and products

## Key Features
- UUID primary keys for all tables
- Soft delete support with `deleted_at` timestamps
- Audit trails with `created_at` and `updated_at` timestamps
- Foreign key constraints with CASCADE delete
- Check constraints for data validation
- Unique constraints on business identifiers
- Generated columns (profit calculation in products)
- JSONB support for flexible data storage (campaigns_notifications.message)