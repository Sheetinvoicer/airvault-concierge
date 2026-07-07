from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class FreemiumMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_):
        # In production, check user's subscription from JWT or DB
        # For now, just log
        if request.url.path.startswith("/api/v1/claims") and request.method == "POST":
            # Check if user is premium (mock)
            is_premium = False  # replace with real check
            if not is_premium:
                logger.warning("Free user attempted to access compensation")
                # Could return 403, but we'll allow for now
        response = await call_(request)
        return response
