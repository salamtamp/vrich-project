# Database Migration Guide

## How to Run Migration

### 1. Start Database
```bash
# Start PostgreSQL database
docker compose up -d postgres

# Check if database is running
docker compose ps
```

### 2. Run Migration

```bash
# Run all migrations in one command
docker compose --profile migration up -d migration && \
docker exec vrich_migration bash -c 'export PGPASSWORD=postgres; for file in /migrations/*.up.sql; do echo "Running: $file"; psql -h postgres -U postgres -d vrich_db -f "$file"; done'
```

### 3. Clean Up
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
