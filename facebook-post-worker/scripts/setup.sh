#!/bin/bash

# Facebook Post Worker Setup Script

set -e

echo "🚀 Setting up Facebook Post Worker..."

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry is not installed. Please install it first:"
    echo "curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
poetry install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/facebook_worker
DATABASE_ECHO=false

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_PORT=15672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_QUEUE_NAME=facebook_posts

# Facebook Configuration (required by existing config)
FACEBOOK_BASE_URL=https://graph.facebook.com/v18.0
FACEBOOK_PAGE_ACCESS_TOKEN=your_facebook_page_access_token_here
FACEBOOK_INBOX_VERIFY_TOKEN=your_facebook_webhook_verify_token_here

# Scheduler Configuration
SCHEDULER_ENABLED=true
SCHEDULER_TIMEZONE=UTC
SCHEDULER_MAX_INSTANCES=3
SCHEDULER_COALESCE=false
SCHEDULER_MISFIRE_GRACE_TIME=300
SCHEDULER_THREAD_POOL_SIZE=20

# Facebook Posts Scheduler
FACEBOOK_POSTS_CRON_SCHEDULE=0 * * * *
FACEBOOK_POSTS_ENABLED=true

# Facebook Comments Scheduler
FACEBOOK_COMMENTS_CRON_SCHEDULE=*/5 * * * *
FACEBOOK_COMMENTS_ENABLED=true

# Environment Configuration
DEBUG=true
ENVIRONMENT=development
EOF
    echo "✅ Created .env file. Please edit it with your actual configuration values."
else
    echo "✅ .env file already exists."
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if PostgreSQL is running
echo "🐘 Checking PostgreSQL..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running."

        # Try to create database
        echo "🗄️  Setting up database..."
        createdb facebook_worker 2>/dev/null || echo "Database already exists or creation failed."

        # Run migrations
        echo "🔄 Running database migrations..."
        poetry run alembic upgrade head
    else
        echo "⚠️  PostgreSQL is not running. Please start it before running the application."
    fi
else
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL."
fi

# Check if RabbitMQ is running
echo "🐰 Checking RabbitMQ..."
if command -v rabbitmq-diagnostics &> /dev/null; then
    if rabbitmq-diagnostics ping &> /dev/null; then
        echo "✅ RabbitMQ is running."
    else
        echo "⚠️  RabbitMQ is not running. You can start it with:"
        echo "   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management"
    fi
else
    echo "⚠️  RabbitMQ not found. You can start it with Docker:"
    echo "   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your actual configuration values"
echo "2. Start the application: poetry run python -m app.main"
echo "3. Or use Docker Compose: docker-compose up -d"
echo ""
echo "API endpoints:"
echo "- Health check: http://localhost:8000/api/v1/healthcheck"
echo "- API docs: http://localhost:8000/docs"
echo ""
echo "For more information, see README.md"