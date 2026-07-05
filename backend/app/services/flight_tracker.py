import aiohttp
import asyncio
from typing import List, Dict, Optional
from app.config import settings
from app.utils.retry import retry_async
from app.utils.circuit_breaker import circuit_breaker
import redis.asyncio as redis
import json
import logging

logger = logging.getLogger(__name__)

class FlightTracker:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)
        self.session: aiohttp.ClientSession = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, *args):
        await self.session.close()
        await self.redis.close()

    @retry_async(max_attempts=3)
    @circuit_breaker("rapidapi")
    async def search_last_minute(self, origin: str, destination: str, date: str) -> List[Dict]:
        """Call RapidAPI (Amadeus/Skyscanner) for flights departing <48h."""
        url = "https://skyscanner-api.p.rapidapi.com/flights/search"
        headers = {"x-rapidapi-key": settings.RAPIDAPI_KEY, "x-rapidapi-host": "skyscanner-api.p.rapidapi.com"}
        params = {"from": origin, "to": destination, "date": date, "adults": 1}
        async with self.session.get(url, headers=headers, params=params) as resp:
            data = await resp.json()
            # Mock response structure – adapt to real API
            flights = []
            for item in data.get("flights", []):
                flights.append({
                    "id": item["id"],
                    "airline": item["airline"],
                    "departure": item["departure_time"],
                    "arrival": item["arrival_time"],
                    "price": item["price"],
                    "currency": item["currency"]
                })
            return flights

    async def get_flight_status(self, flight_id: str) -> Optional[Dict]:
        cache_key = f"flight_status_{flight_id}"
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        # Fetch real status from AeroDataBox or AviationStack (mocked)
        # Simulate
        status = {"flight_id": flight_id, "status": "On time", "delay": 0}
        await self.redis.setex(cache_key, 30, json.dumps(status))  # TTL 30s
        return status

    async def get_broadcast_update(self) -> Dict:
        """Get a general broadcast (all active flights)."""
        # In production, fetch from real source
        return {"message": "Flight updates", "timestamp": asyncio.get_event_loop().time()}
