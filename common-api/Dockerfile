# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app
COPY pyproject.toml poetry.lock ./

# Install poetry and configure it to create virtual environment in project directory
RUN pip install poetry && \
    poetry config virtualenvs.in-project true && \
    poetry install --only main --no-root

# Production stage
FROM python:3.12-slim

WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the virtual environment - use the correct path
COPY --from=builder /app/.venv /app/.venv
COPY . .

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 3001

CMD ["/app/.venv/bin/uvicorn", "app.main:socket_app", "--host", "0.0.0.0", "--port", "3001"]