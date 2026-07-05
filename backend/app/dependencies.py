from app.services.flight_tracker import FlightTracker
from app.services.compensation import CompensationService
from app.services.meal_orchestrator import MealOrchestrator
from app.services.ride_hailing import RideHailingService
from app.services.pet_compliance import PetComplianceService
from app.core.event_sourcing import EventStore
from app.db.session import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

def get_flight_tracker():
    return FlightTracker()

def get_compensation_service():
    return CompensationService()

def get_meal_orchestrator():
    return MealOrchestrator()

def get_ride_service():
    return RideHailingService()

def get_pet_service():
    return PetComplianceService()

def get_event_store():
    return EventStore()

def get_redis_client():
    import redis.asyncio as redis
    from app.config import settings
    return redis.from_url(settings.REDIS_URL)
