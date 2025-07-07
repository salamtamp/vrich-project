#!/bin/bash

# Development script for Facebook Page API

echo "Starting Facebook Page API development server..."

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Poetry is not installed. Please install it first:"
    echo "curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

# Install dependencies if needed
if [ ! -d ".venv" ]; then
    echo "Installing dependencies..."
    poetry install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file with your configuration values."
fi

# Start the development server
echo "Starting development server..."
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Summary

I've created the following files for your FastAPI project:

1. **`pyproject.toml`** - Poetry configuration with all necessary dependencies
2. **`.env`** - Environment variables template
3. **`.env.example`** - Example environment file for version control
4. **`.gitignore`** - Comprehensive gitignore for Python projects
5. **`README.md`** - Project documentation with setup instructions
6. **`scripts/dev.sh`** - Development script for easy startup

### Key Dependencies Included:

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Pydantic-settings** - Settings management
- **Python-dotenv** - Environment variable loading
- **HTTPX** - HTTP client for testing
- **Development tools**: Black (formatter), isort (import sorter), flake8 (linter), mypy (type checker), pytest (testing)

### To get started:

1. Install Poetry: `curl -sSL https://install.python-poetry.org | python3 -`
2. Install dependencies: `poetry install`
3. Copy environment file: `cp .env.example .env`
4. Edit `.env` with your settings
5. Run the development server: `poetry run uvicorn app.main:app --reload`

The project is now properly configured with Poetry for dependency management and includes all the necessary environment configuration files!