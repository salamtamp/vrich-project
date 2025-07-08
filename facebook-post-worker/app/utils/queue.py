import pika
import json
import time
from .logging import log_message

class Queue:
    def __init__(self, host, username, password, reconnect_delay=1):
        self.host = host
        self.username = username
        self.password = password
        self.connection = None
        self.channel = None
        self.reconnect_delay = reconnect_delay
        self.consumer_active = True
        self.publisher_active = False

    def connect(self):
        """Establishes a connection to RabbitMQ with retries."""
        while True:
            try:
                log_message("Queue", "debug", "Connecting to RabbitMQ...")
                params = pika.ConnectionParameters(
                    host=self.host,
                    credentials=pika.PlainCredentials(self.username, self.password)
                )

                self.connection = pika.BlockingConnection(params)
                self.channel = self.connection.channel()

                log_message("Queue", "debug", "Connected to RabbitMQ.")
                return
            except Exception as e:
                log_message("Queue", "error", f"Connection failed: {e}. Retrying in {self.reconnect_delay} seconds...")
                time.sleep(self.reconnect_delay)

    def ensure_connection(self):
        """Ensures an active connection before publishing or consuming."""
        if self.channel is None or self.connection is None or self.connection.is_closed or self.channel.is_closed:
            log_message("Queue", "warning", "Lost connection, reconnecting...")
            self.connect()

    def publish(self, queue_name, msg):
        """Publishes a message to the queue with auto-reconnect handling."""
        try:
            self.consumer_active = False
            self.publisher_active = True

            self.ensure_connection()
            log_message("Queue", "debug", "Consumer temporarily paused after publishing.")

            self.channel.queue_declare(queue=queue_name, durable=True)

            if queue_name != "temp_queue":
                self.channel.basic_publish(
                    exchange='',
                    routing_key=queue_name,
                    body=json.dumps(msg),
                    properties=pika.BasicProperties(delivery_mode=2)
                )
                log_message("Queue", "info", f"Published to {queue_name}: {msg}")

            time.sleep(1)
            self.consumer_active = True
            self.publisher_active = False
            log_message("Queue", "debug", "Consumer resumed after publishing.")

        except Exception as e:
            log_message("Queue", "error", f"Publish failed: {e}. Reconnecting...")
            self.consumer_active = True
            self.publisher_active = False
            time.sleep(self.reconnect_delay)
            self.connect()

    def consume(self, queue_name, log, callback):
        """Consumes messages with auto-reconnection and control over consumer activity."""
        while True:
            try:
                if self.consumer_active:
                    self.ensure_connection()
                    self.channel.queue_declare(queue=queue_name, durable=True)

                    log_message("Queue", "info", f"Consuming messages from {queue_name}")

                    def on_message(channel, method, properties, body):
                        try:
                            msg = json.loads(body)
                            log()
                            callback(msg)
                            channel.basic_ack(delivery_tag=method.delivery_tag)
                        except Exception as e:
                            log_message("Queue", "error", f"Message processing error: {e}")
                            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

                    self.channel.basic_consume(queue=queue_name, on_message_callback=on_message, auto_ack=False)
                    self.channel.start_consuming()
                else:
                    log_message("Queue", "debug", "Consumer is paused, skipping consumption.")
                    time.sleep(1)

            except (pika.exceptions.AMQPConnectionError, pika.exceptions.ChannelClosed, Exception) as e:
                log_message("Queue", "error", f"Consumer error: {e}. Reconnecting in {self.reconnect_delay} seconds...")
                time.sleep(self.reconnect_delay)
                self.connect()

    def close(self):
        """Closes the RabbitMQ connection gracefully."""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            log_message("Queue", "debug", "RabbitMQ connection closed.")