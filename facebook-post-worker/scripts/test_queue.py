#!/usr/bin/env python3
"""
Test script for queue consumer functionality.
This script publishes test messages to the queue to verify the consumer works.
"""

import json
import time
import pika
from app.core.config import settings
from app.utils.logging import log_message


def publish_test_message():
    """Publish a test Facebook post message to the queue."""
    try:
        # Connect to RabbitMQ
        credentials = pika.PlainCredentials(settings.RABBITMQ_USER, settings.RABBITMQ_PASS)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=settings.RABBITMQ_HOST, credentials=credentials)
        )
        channel = connection.channel()

        # Declare queue
        channel.queue_declare(queue=settings.RABBITMQ_QUEUE_NAME, durable=True)

        # Test message
        test_message = {
            "id": f"test_post_{int(time.time())}",
            "from": {
                "id": "123456789",
                "name": "Test Facebook Page"
            },
            "message": "This is a test Facebook post message",
            "created_time": "2024-01-01T12:00:00Z",
            "updated_time": "2024-01-01T12:30:00Z",
            "status_type": "published_story",
            "permalink_url": "https://facebook.com/test-post"
        }

        # Publish message
        channel.basic_publish(
            exchange='',
            routing_key=settings.RABBITMQ_QUEUE_NAME,
            body=json.dumps(test_message),
            properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
        )

        log_message("TestScript", "info", f"Published test message: {test_message['id']}")

        connection.close()
        return True

    except Exception as e:
        log_message("TestScript", "error", f"Failed to publish test message: {e}")
        return False


def main():
    """Main function to run the test."""
    print("Testing queue consumer functionality...")
    print(f"Publishing test message to queue: {settings.RABBITMQ_QUEUE_NAME}")

    success = publish_test_message()

    if success:
        print("✅ Test message published successfully!")
        print("Check the application logs to see if the message was processed.")
    else:
        print("❌ Failed to publish test message.")
        print("Make sure RabbitMQ is running and the queue exists.")


if __name__ == "__main__":
    main()