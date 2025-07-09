import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger = logging.getLogger("app.middleware")
        logger.info("Request: %s %s", request.method, request.url)
        response = await call_next(request)
        logger.info("Response status: %s", response.status_code)
        return response
