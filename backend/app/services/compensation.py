from app.models.claim import Claim
from app.core.state_machine import DelayClaimStateMachine
from app.services.kafka_producer import kafka_producer
from app.config import settings
from app.db.session import async_session
from sqlalchemy import select
import stripe

class CompensationService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY

    async def process_claim(self, flight_id: str, passenger_id: str, delay_minutes: int) -> Claim:
        # Logic similar to delay_processor, but exposed as API
        # Reuse code – we'll simplify
        # ...
        pass

    async def get_claims_for_user(self, user_id: str):
        async with async_session() as db:
            stmt = select(Claim).where(Claim.passenger_id == user_id)
            result = await db.execute(stmt)
            return result.scalars().all()
