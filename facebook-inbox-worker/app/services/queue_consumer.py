from app.core.config import settings
from app.services.facebook_inbox_processor import FacebookInboxProcessor
from app.utils.logging import log_message
from app.utils.queue import Queue
from typing import Dict, Any

import threading


class QueueConsumer:
    def __init__(self):
        self.queue = None
        self.facebook_inbox_processor = FacebookInboxProcessor()
        self.consumer_thread = None
        self.is_running = False

    def start(self):
        """Start the queue consumer."""
        if self.is_running:
            log_message("QueueConsumer", "warning", "Consumer is already running")
            return

        try:
            # Initialize queue connection
            self.queue = Queue(
                host=settings.QUEUE_HOST,
                username=settings.QUEUE_USER,
                password=settings.QUEUE_PASS,
            )
            self.queue.connect()

            # Start consumer thread
            self.is_running = True
            self.consumer_thread = threading.Thread(target=self._consume_messages)
            self.consumer_thread.daemon = True
            self.consumer_thread.start()

            log_message("QueueConsumer", "info", "Queue consumer started successfully")

        except Exception as e:
            log_message("QueueConsumer", "error", f"Failed to start queue consumer: {e}")
            self.is_running = False

    def stop(self):
        """Stop the queue consumer."""
        self.is_running = False

        if self.queue:
            self.queue.close()

        if self.consumer_thread and self.consumer_thread.is_alive():
            self.consumer_thread.join(timeout=5)

        log_message("QueueConsumer", "info", "Queue consumer stopped")

    def _consume_messages(self):
        """Consume messages from the queue."""
        def message_callback(message: Dict[str, Any]):
            """Callback function for processing messages."""
            try:
                log_message("QueueConsumer", "debug", f"Processing message: {message.get('id', 'unknown')}")
                success = self.facebook_inbox_processor.process_facebook_inbox(message)

                if success:
                    log_message("QueueConsumer", "debug", f"Message processed successfully: {message.get('id', 'unknown')}")
                else:
                    log_message("QueueConsumer", "error", f"Failed to process message: {message.get('id', 'unknown')}")

            except Exception as e:
                log_message("QueueConsumer", "error", f"Error in message callback: {e}")

        def log_callback():
            """Callback function for logging."""
            log_message("QueueConsumer", "debug", "Consuming messages from queue")

        try:
            self.queue.consume(
                queue_name=settings.QUEUE_NAME,
                log=log_callback,
                callback=message_callback
            )
        except Exception as e:
            log_message("QueueConsumer", "error", f"Error in consume loop: {e}")
        finally:
            self.is_running = False