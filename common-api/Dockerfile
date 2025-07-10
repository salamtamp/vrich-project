# Build stage
FROM python:3.12-slim as builder

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry install --only main

# Production stage
FROM python:3.12-slim

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY . .

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/healthcheck || exit 1

EXPOSE 3001
CMD ["/app/.venv/bin/uvicorn", "app.main:socket_app", "--host", "0.0.0.0", "--port", "3001"]