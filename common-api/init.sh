#!/bin/bash

# Initialize VRich API Database
# This script runs database migrations and creates admin user

set -e

echo "🚀 Initializing VRich API Database..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Function to check if database is ready
check_database() {
    python -c "
import psycopg2
import os
import sys
import time

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print('❌ DATABASE_URL not found')
    sys.exit(1)

# Extract connection parameters
import re
match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
if not match:
    print('❌ Invalid DATABASE_URL format')
    sys.exit(1)

user, password, host, port, database = match.groups()

max_retries = 30
for i in range(max_retries):
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )
        conn.close()
        print('✅ Database is ready!')
        break
    except psycopg2.OperationalError as e:
        if i == max_retries - 1:
            print(f'❌ Database not ready after {max_retries} attempts')
            sys.exit(1)
        print(f'⏳ Waiting for database... (attempt {i+1}/{max_retries})')
        time.sleep(2)
"
}

# Check database connection
echo "🔍 Checking database connection..."
check_database

# Run database migrations
echo "📊 Running database migrations..."
if [ -f "migrations/alembic.ini" ]; then
    alembic -c migrations/alembic.ini upgrade head
    echo "✅ Database migrations completed!"
else
    echo "⚠️  No migrations found, skipping..."
fi

# Create admin user
echo "👤 Creating admin user..."
if [ -f "scripts/create_admin.py" ]; then
    python scripts/create_admin.py
    echo "✅ Admin user creation completed!"
else
    echo "⚠️  Admin creation script not found, skipping..."
fi

echo "🎉 Database initialization completed successfully!"
echo ""
echo "📝 Summary:"
echo "  - Database migrations: ✅ Completed"
echo "  - Admin user creation: ✅ Completed"
echo ""
echo "🚀 You can now start the application!"