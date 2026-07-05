from app.core.pet_engine import pet_engine
import aiohttp
from bs4 import BeautifulSoup
from app.utils.retry import retry_async
from app.utils.circuit_breaker import circuit_breaker
import redis.asyncio as redis
import json
from app.config import settings

class PetComplianceService:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)

    @retry_async(max_attempts=3)
    @circuit_breaker("iata")
    async def get_requirements(self, origin: str, destination: str):
        # Check cache
        cache_key = f"pet_{origin}_{destination}"
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
        # In production, scrape IATA/APHIS using aiohttp + BeautifulSoup
        # For now, use pet_engine's mock
        req = await pet_engine.fetch_requirements(origin, destination)
        # Cache for 1 hour
        await self.redis.setex(cache_key, 3600, req.json())
        return req

    async def generate_pdf(self, origin, destination, owner_name, pet_name):
        req = await self.get_requirements(origin, destination)
        return await pet_engine.generate_pdf_checklist(req, owner_name, pet_name)
