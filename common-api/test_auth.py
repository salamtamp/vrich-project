#!/usr/bin/env python3
"""
Simple test script to verify authentication
"""

import asyncio
from datetime import timedelta

import httpx

from app.core.security import create_access_token, decode_access_token


def test_token_creation():
    """Test token creation and decoding"""
    print("Testing token creation and decoding...")

    # Create a test token
    test_data = {"sub": "test-user-123", "email": "test@example.com"}
    token = create_access_token(test_data, expires_delta=timedelta(minutes=30))

    print(f"Created token: {token[:50]}...")

    # Decode the token
    try:
        payload = decode_access_token(token)
        print(f"Decoded payload: {payload}")
        print("✅ Token creation and decoding successful")
        return token
    except Exception as e:
        print(f"❌ Token decoding failed: {e}")
        return None


async def test_auth_endpoint(token):
    """Test the auth endpoint"""
    print("\nTesting auth endpoint...")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"http://localhost:8000/debug/token?token={token}"
            )
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")

            if response.status_code == 200:
                print("✅ Auth endpoint test successful")
                return True
            print("❌ Auth endpoint test failed")
            return False
        except Exception as e:
            print(f"❌ Auth endpoint error: {e}")
            return False


async def test_socket_auth(token):
    """Test Socket.IO authentication"""
    print("\nTesting Socket.IO authentication...")

    import socketio

    sio = socketio.Client()

    @sio.event
    def connect():
        print("✅ Socket.IO connection successful")

    @sio.event
    def disconnect():
        print("Socket.IO disconnected")

    @sio.event
    def connected(data):
        print(f"✅ Socket.IO authentication successful: {data}")

    @sio.event
    def connect_error(error):
        print(f"❌ Socket.IO connection error: {error}")

    try:
        sio.connect("http://localhost:8000", auth={"token": token})
        print("✅ Socket.IO authentication test successful")
        sio.disconnect()
        return True
    except Exception as e:
        print(f"❌ Socket.IO authentication failed: {e}")
        return False


async def main():
    """Main test function"""
    print("🔐 Testing authentication system...")

    # Test token creation and decoding
    token = test_token_creation()
    if not token:
        print("❌ Token test failed, exiting")
        return

    # Test auth endpoint
    auth_ok = await test_auth_endpoint(token)

    # Test Socket.IO authentication
    socket_ok = await test_socket_auth(token)

    # Summary
    print("\n📊 Authentication Test Summary:")
    print("Token creation/decoding: ✅")
    print(f"Auth endpoint: {'✅' if auth_ok else '❌'}")
    print(f"Socket.IO auth: {'✅' if socket_ok else '❌'}")

    if auth_ok and socket_ok:
        print("\n🎉 All authentication tests passed!")
    else:
        print("\n❌ Some authentication tests failed")


if __name__ == "__main__":
    asyncio.run(main())
