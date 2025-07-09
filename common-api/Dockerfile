# Use Python 3.12 slim image for smaller size
FROM python:3.12-slim AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies required for building Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        gcc \
        python3-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.8.3

# Configure Poetry to create virtual environment in project
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Set work directory
WORKDIR /app

# Copy Poetry files
COPY pyproject.toml poetry.lock* ./

# Create virtual environment explicitly and install dependencies
RUN python -m venv /app/.venv \
    && . /app/.venv/bin/activate \
    && poetry install --only=main --no-root \
    && rm -rf $POETRY_CACHE_DIR

# Verify .venv was created
RUN ls -la /app/.venv/bin/

# Production stage
FROM python:3.12-slim AS production

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="/app"

# Set default values for runtime configuration
ENV HOST=0.0.0.0 \
    PORT=8000 \
    WORKERS=1 \
    UPLOAD_DIR=/app/uploads \
    MAX_FILE_SIZE=10485760 \
    ALLOWED_EXTENSIONS="jpg,jpeg,png,gif,pdf,doc,docx" \
    INTERNAL_WEBHOOK_IPS="127.0.0.1,10.0.0.1"

# All other environment variables should be provided at runtime:
# DEBUG, PROJECT_NAME, VERSION, DESCRIPTION
# DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES  
# ALLOWED_HOSTS_RAW, API_V1_STR
# INTERNAL_WEBHOOK_IPS (comma-separated, e.g. 127.0.0.1,10.0.0.1)

# Install runtime dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        libpq5 \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder --chown=appuser:appuser /app/.venv /app/.venv

# Make sure we can use the virtual environment
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY --chown=appuser:appuser . .

# Create directories for logs and other runtime files
RUN mkdir -p /app/logs /app/uploads \
    && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose the port
EXPOSE ${PORT}

# Add labels for better container management
LABEL maintainer="piyawat@example.com" \
      version="1.0.0" \
      description="VRich FastAPI Application"

# Use exec form for better signal handling with environment variables
CMD ["sh", "-c", "uvicorn app.main:socket_app --host $HOST --port $PORT --workers $WORKERS"]