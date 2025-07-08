# Facebook Post Worker

A FastAPI-based worker service that consumes Facebook post messages from a RabbitMQ queue and stores them in a PostgreSQL database.

## Features

- **Health Check API**: `/api/v1/healthcheck` endpoint that returns `{"status": "OK"}`
- **Queue Consumer**: Consumes messages from RabbitMQ queue using the existing Queue utility
- **Database Storage**: Formats and saves Facebook post data to PostgreSQL database
- **REST API**: Endpoints to retrieve stored Facebook posts
- **Database Migrations**: Alembic integration for database schema management

## Project Structure

```
facebook-post-worker/
├── app/
│   ├── api/
│   │   ├── middleware/
│   │   ├── routes.py          # API endpoints
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   └── logging.py
│   ├── models/
│   │   ├── database.py        # Database configuration
│   │   ├── facebook_post.py   # Facebook post model
│   │   └── __init__.py
│   ├── services/
│   │   ├── message_processor.py  # Message processing logic
│   │   ├── queue_consumer.py     # Queue consumer service
│   │   └── __init__.py
│   ├── utils/
│   │   ├── queue.py           # Existing queue utility
│   │   └── logging.py
│   └── main.py                # FastAPI application
├── alembic/                   # Database migrations
├── logs/                      # Application logs
├── pyproject.toml            # Dependencies and project config
├── alembic.ini               # Alembic configuration
└── README.md
```

## Prerequisites

- Python 3.9+
- PostgreSQL
- RabbitMQ
- Poetry (for dependency management)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd facebook-post-worker
   ```

2. **Install dependencies**:
   ```bash
   poetry install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/facebook_worker

   # RabbitMQ
   RABBITMQ_HOST=localhost
   RABBITMQ_USER=guest
   RABBITMQ_PASS=guest
   RABBITMQ_QUEUE_NAME=facebook_posts

   # Facebook (required by existing config)
   FACEBOOK_BASE_URL=https://graph.facebook.com/v18.0
   FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
   FACEBOOK_INBOX_VERIFY_TOKEN=your_verify_token_here

   # API
   API_HOST=0.0.0.0
   API_PORT=8000

   # Environment
   DEBUG=true
   ENVIRONMENT=development
   ```

4. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb facebook_worker

   # Run migrations
   poetry run alembic upgrade head
   ```

5. **Start RabbitMQ** (if not already running):
   ```bash
   # Using Docker
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

## Usage

### Running the Application

1. **Start the application**:
   ```bash
   poetry run python -m app.main
   ```

   Or using uvicorn directly:
   ```bash
   poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Access the API**:
   - Health check: `GET http://localhost:8000/api/v1/healthcheck`
   - API documentation: `http://localhost:8000/docs`

### API Endpoints

- `GET /api/v1/healthcheck` - Health check endpoint
- `GET /api/v1/posts` - Get all Facebook posts (with pagination)
- `GET /api/v1/posts/{post_id}` - Get specific Facebook post by post_id

### Queue Message Format

The application expects Facebook post messages in the following format:

```json
{
  "id": "post_id_here",
  "from": {
    "id": "page_id_here",
    "name": "Page Name"
  },
  "message": "Post message content",
  "created_time": "2024-01-01T12:00:00Z",
  "updated_time": "2024-01-01T12:00:00Z",
  "status_type": "published_story",
  "permalink_url": "https://facebook.com/post_url"
}
```

### Database Schema

The `facebook_posts` table stores:
- `id`: Primary key
- `post_id`: Facebook post ID (unique)
- `page_id`: Facebook page ID
- `message`: Post message content
- `created_time`: When the post was created
- `updated_time`: When the post was last updated
- `status_type`: Post status type
- `permalink_url`: Direct link to the post
- `raw_data`: Original message data (JSON)
- `processed_at`: When the message was processed

## Development

### Running Tests

```bash
poetry run pytest
```

### Code Formatting

```bash
poetry run black .
poetry run isort .
```

### Type Checking

```bash
poetry run mypy app/
```

### Database Migrations

```bash
# Create a new migration
poetry run alembic revision --autogenerate -m "Description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migration
poetry run alembic downgrade -1
```

## Docker Support

The project includes Docker support. You can build and run the application using:

```bash
# Build the image
docker build -t facebook-post-worker .

# Run the container
docker run -p 8000:8000 --env-file .env facebook-post-worker
```

## Monitoring and Logging

The application includes comprehensive logging:
- Application logs are written to the `logs/` directory
- Queue operations are logged with appropriate levels
- Database operations are logged for debugging
- Health check endpoint for monitoring

## Configuration

Key configuration options in `app/core/config.py`:

- `DATABASE_URL`: PostgreSQL connection string
- `RABBITMQ_*`: RabbitMQ connection settings
- `API_HOST/PORT`: API server settings
- `DEBUG`: Enable debug mode
- `ENVIRONMENT`: Environment name

## Troubleshooting

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Ensure database exists and migrations are applied

2. **Queue Connection Issues**:
   - Verify RabbitMQ is running
   - Check RabbitMQ credentials in `.env`
   - Ensure queue exists

3. **Message Processing Issues**:
   - Check application logs in `logs/` directory
   - Verify message format matches expected schema
   - Check database connection and permissions

## License

[Add your license information here]