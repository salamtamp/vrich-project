# Database Migration Guide

## How to Run Migration

### 1. Run Migration

```bash
docker compose --profile migration up migration
```

### 1. Clean Up
```bash
# Stop migration container
docker compose --profile migration down

# Stop all services
docker compose down
```

## File Structure
```
project/
├── docker compose.yml
├── facebook/
│   └── migrations/
│       ├── 000001_create_facebook_profiles.up.sql
│       ├── 000002_add_indexes.up.sql
│       └── ...
└── README.md
```
