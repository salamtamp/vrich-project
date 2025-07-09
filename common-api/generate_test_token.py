#!/usr/bin/env python3
"""
Script to generate a valid test token for Socket.IO authentication
"""

import os
import sys

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "app"))  # noqa: PTH118, PTH120

from datetime import timedelta

from app.core.security import create_access_token


def generate_test_token():
    """Generate a test token for Socket.IO authentication"""
    # Create test user data
    test_data = {
        "sub": "test-user-123",  # Required field for Socket.IO auth
        "email": "test@example.com",
        "name": "Test User",
    }

    # Create token with 30 minute expiration
    token = create_access_token(test_data, expires_delta=timedelta(minutes=30))

    print("Generated test token for Socket.IO authentication:")
    print(f"Token: {token}")
    print("\nYou can use this token in your test-socket.js file")
    print("Replace 'REPLACE_WITH_A_VALID_TOKEN' with the token above")

    return token


if __name__ == "__main__":
    generate_test_token()
