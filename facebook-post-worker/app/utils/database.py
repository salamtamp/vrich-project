import psycopg2
import psycopg2.extras
import time
from typing import Optional, Dict, Any, List
from .logging import log_message

class Database:
    def __init__(self, host: str, port: int, user: str, password: str, database: str,
                 sslmode: str = "disable", timeout: int = 30, reconnect_delay: int = 1):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database
        self.sslmode = sslmode
        self.timeout = timeout
        self.reconnect_delay = reconnect_delay
        self.connection = None
        self.cursor = None

    def connect(self):
        """Establishes a connection to PostgreSQL with retries."""
        while True:
            try:
                log_message("Database", "debug", "Connecting to PostgreSQL...")

                self.connection = psycopg2.connect(
                    host=self.host,
                    port=self.port,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    sslmode=self.sslmode,
                    connect_timeout=self.timeout
                )

                self.cursor = self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

                log_message("Database", "debug", "Connected to PostgreSQL.")
                return
            except Exception as e:
                log_message("Database", "error", f"Connection failed: {e}. Retrying in {self.reconnect_delay} seconds...")
                time.sleep(self.reconnect_delay)

    def ensure_connection(self):
        """Ensures an active connection before executing queries."""
        if self.connection is None or self.connection.closed:
            log_message("Database", "warning", "Lost connection, reconnecting...")
            self.connect()

    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Executes a SELECT query and returns results."""
        try:
            self.ensure_connection()

            self.cursor.execute(query, params)
            results = self.cursor.fetchall()

            return [dict(row) for row in results]

        except Exception as e:
            log_message("Database", "error", f"Query execution failed: {e}. Reconnecting...")
            time.sleep(self.reconnect_delay)
            self.connect()
            return self.execute_query(query, params)

    def execute_command(self, command: str, params: Optional[tuple] = None) -> int:
        """Executes an INSERT, UPDATE, or DELETE command and returns affected rows."""
        try:
            self.ensure_connection()

            self.cursor.execute(command, params)
            affected_rows = self.cursor.rowcount
            self.connection.commit()

            log_message("Database", "debug", f"Command executed successfully. Affected rows: {affected_rows}")
            return affected_rows

        except Exception as e:
            log_message("Database", "error", f"Command execution failed: {e}. Rolling back and reconnecting...")
            if self.connection and not self.connection.closed:
                self.connection.rollback()
            time.sleep(self.reconnect_delay)
            self.connect()
            return self.execute_command(command, params)

    def execute_many(self, command: str, params_list: List[tuple]) -> int:
        """Executes a command with multiple parameter sets."""
        try:
            self.ensure_connection()

            self.cursor.executemany(command, params_list)
            affected_rows = self.cursor.rowcount
            self.connection.commit()

            log_message("Database", "debug", f"Batch command executed successfully. Affected rows: {affected_rows}")
            return affected_rows

        except Exception as e:
            log_message("Database", "error", f"Batch command execution failed: {e}. Rolling back and reconnecting...")
            if self.connection and not self.connection.closed:
                self.connection.rollback()
            time.sleep(self.reconnect_delay)
            self.connect()
            return self.execute_many(command, params_list)

    def begin_transaction(self):
        """Begins a database transaction."""
        self.ensure_connection()
        log_message("Database", "debug", "Transaction begun")

    def commit_transaction(self):
        """Commits the current transaction."""
        if self.connection and not self.connection.closed:
            self.connection.commit()
            log_message("Database", "debug", "Transaction committed")

    def rollback_transaction(self):
        """Rolls back the current transaction."""
        if self.connection and not self.connection.closed:
            self.connection.rollback()
            log_message("Database", "debug", "Transaction rolled back")

    def close(self):
        """Closes the PostgreSQL connection gracefully."""
        if self.cursor:
            self.cursor.close()
        if self.connection and not self.connection.closed:
            self.connection.close()
            log_message("Database", "debug", "PostgreSQL connection closed.")

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()