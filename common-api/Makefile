# Makefile for Common API

.PHONY: help install install-dev install-test dev test test-watch lint format type-check clean clean-all docker-build docker-run docker-stop

# Default target
help:
	@echo "Common API - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install      - Install production dependencies"
	@echo "  install-dev  - Install all dependencies (including dev tools)"
	@echo "  install-test - Install test dependencies"
	@echo "  dev          - Start development server with hot reload"
	@echo "  dev-debug    - Start development server with debug logging"
	@echo ""
	@echo "Testing:"
	@echo "  test         - Run all tests"
	@echo "  test-watch   - Run tests in watch mode"
	@echo "  test-cov     - Run tests with coverage report"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint         - Run all linting checks"
	@echo "  format       - Format code with black and isort"
	@echo "  format-check - Check if code is properly formatted"
	@echo "  type-check   - Run type checking with mypy"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo "  docker-stop  - Stop Docker container"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        - Remove Python cache files"
	@echo "  clean-all    - Remove all generated files and virtual environment"
	@echo "  update-deps  - Update all dependencies"
	@echo ""
	@echo "Seeds:"
	@echo "  seed-create-admin - Create admin user"
	@echo "  seed-users        - Seed users"
	@echo "  seed-facebook-profiles - Seed Facebook profiles"
	@echo "  seed-facebook-posts - Seed Facebook posts"
	@echo "  seed-facebook-inboxes - Seed Facebook inboxes"
	@echo "  seed-facebook-comments - Seed Facebook comments"
	@echo "  seed-all - Seed all"

# Check if poetry is installed
check-poetry:
	@if ! command -v poetry &> /dev/null; then \
		echo "Poetry is not installed. Please install it first:"; \
		echo "curl -sSL https://install.python-poetry.org | python3 -"; \
		exit 1; \
	fi

# Installation commands
install: check-poetry
	@echo "Installing production dependencies..."
	poetry install --only main

install-dev: check-poetry
	@echo "Installing all dependencies (including dev tools)..."
	poetry install

install-test: check-poetry
	@echo "Installing test dependencies..."
	poetry install --with test

# Development commands
dev: check-poetry
	@echo "Starting development server..."
	poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 3001

dev-debug: check-poetry
	@echo "Starting development server with debug logging..."
	poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 3001 --log-level debug

# Testing commands
test: check-poetry
	@echo "Running tests..."
	poetry run pytest

test-watch: check-poetry
	@echo "Running tests in watch mode..."
	poetry run pytest --watch

test-cov: check-poetry
	@echo "Running tests with coverage..."
	poetry run pytest --cov=app --cov-report=html --cov-report=term-missing

# Code quality commands
lint: check-poetry
	@echo "Running linting checks..."
	poetry run flake8 app tests
	poetry run black --check app tests
	poetry run isort --check-only app tests

format: check-poetry
	@echo "Formatting code..."
	poetry run black app tests
	poetry run isort app tests

format-check: check-poetry
	@echo "Checking code formatting..."
	poetry run black --check app tests
	poetry run isort --check-only app tests

type-check: check-poetry
	@echo "Running type checking..."
	poetry run mypy app

# Maintenance commands
clean:
	@echo "Cleaning Python cache files..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

clean-all: clean
	@echo "Removing virtual environment and all generated files..."
	rm -rf .venv
	rm -rf dist
	rm -rf build
	rm -rf htmlcov
	rm -rf .coverage

update-deps: check-poetry
	@echo "Updating all dependencies..."
	poetry update

# Environment setup
setup-env:
	@echo "Setting up environment..."
	@if [ ! -f ".env" ]; then \
		if [ -f ".env.example" ]; then \
			cp .env.example .env; \
			echo "Created .env file from .env.example"; \
			echo "Please edit .env file with your configuration values."; \
		else \
			echo "No .env.example file found. Please create .env file manually."; \
		fi; \
	else \
		echo ".env file already exists."; \
	fi

# Quick setup for new developers
setup: check-poetry setup-env install-dev
	@echo "Project setup complete!"
	@echo "Run 'make dev' to start the development server."

# Webhook commands
webhook-facebook-post-%: check-poetry
	curl -X POST http://localhost:3001/api/v1/webhooks/facebook-posts \
	  -H "Content-Type: application/json" \
	  -d '{"event": "seeded_event", "id": "$*"}'

webhook-facebook-inbox-%: check-poetry
	curl -X POST http://localhost:3001/api/v1/webhooks/facebook-inboxes \
	  -H "Content-Type: application/json" \
	  -d '{"event": "seeded_event", "id": "$*"}'

webhook-facebook-comment-%: check-poetry
	curl -X POST http://localhost:3001/api/v1/webhooks/facebook-comments \
	  -H "Content-Type: application/json" \
	  -d '{"event": "seeded_event", "id": "$*"}'

# Seeds commands
seed-create-admin: check-poetry
	poetry run python scripts/create_admin.py

seed-users: check-poetry
	poetry run python app/seeds/seed_users.py

seed-facebook-profiles: check-poetry
	poetry run python app/seeds/seed_facebook_profiles.py

seed-facebook-posts: check-poetry
	poetry run python app/seeds/seed_facebook_posts.py

seed-facebook-inboxes: check-poetry
	poetry run python app/seeds/seed_facebook_inboxes.py

seed-facebook-comments: check-poetry
	poetry run python app/seeds/seed_facebook_comments.py

seed-all: seed-create-admin seed-users seed-facebook-profiles seed-facebook-posts seed-facebook-inboxes seed-facebook-comments
