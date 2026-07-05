import asyncio
import json
import logging
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from app.core.event_sourcing import EventStore
from app.core.state_machine import DelayClaimStateMachine
from app.models.claim import Claim
from app.services.compensation import CompensationService
from app.services.kafka_consumer import KafkaConsumerBase
from app.services.kafka_producer import kafka_producer
from app.config import settings
from app.db.session import async_session
from sqlalchemy import select
from pydantic import BaseModel
import stripe  # stripe library

logger = logging.getLogger(__name__)

class FlightDelayEvent(BaseModel):
    flight_id: str
    airline: str
    departure_airport: str
    arrival_airport: str
    scheduled_departure: datetime
    actual_departure: datetime
    delay_minutes: int
    passenger_id: str

class DelayProcessor(KafkaConsumerBase):
    """Kafka consumer that listens to flight delay events and generates compensation claims."""
    
    def __init__(self):
        super().__init__(
            topic=settings.KAFKA_DELAY_TOPIC,
            group_id="delay_processor",
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS
        )
        self.env = Environment(loader=FileSystemLoader("app/templates"))
        self.stripe_api_key = settings.STRIPE_SECRET_KEY
        stripe.api_key = self.stripe_api_key

    async def process_message(self, msg: dict):
        try:
            event = FlightDelayEvent(**msg)
            logger.info(f"Processing delay event for flight {event.flight_id}, delay {event.delay_minutes} min")

            # Only process if delay > 3 hours (180 minutes)
            if event.delay_minutes < 180:
                logger.info(f"Delay {event.delay_minutes} min below threshold, skipping.")
                return

            # 1. Check if claim already exists (idempotency)
            async with async_session() as db:
                stmt = select(Claim).where(Claim.flight_id == event.flight_id, Claim.passenger_id == event.passenger_id)
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                if existing:
                    logger.info(f"Claim already exists for flight {event.flight_id}, skipping.")
                    return

            # 2. Determine payout based on EU261/APRA (simplified)
            # Distance bands: €250 (≤1500km), €400 (>1500km and intra-EU), €600 (>3500km)
            # We'll simulate distance using a static map or API.
            distance_km = 2000  # mock
            if distance_km <= 1500:
                payout = 250
            elif distance_km <= 3500:
                payout = 400
            else:
                payout = 600

            # 3. Generate legal letter using Jinja2
            template = self.env.get_template("claim_letter.jinja2")
            letter_content = template.render(
                passenger_id=event.passenger_id,
                flight_id=event.flight_id,
                airline=event.airline,
                delay=event.delay_minutes,
                payout=payout,
                date=datetime.utcnow().strftime("%Y-%m-%d")
            )

            # 4. Create claim record in DB with state machine
            claim = Claim(
                flight_id=event.flight_id,
                passenger_id=event.passenger_id,
                airline=event.airline,
                delay_minutes=event.delay_minutes,
                payout_amount=payout,
                status="pending",  # initial
                claim_letter=letter_content,
            )
            async with async_session() as db:
                db.add(claim)
                await db.commit()
                await db.refresh(claim)

            # 5. Execute Stripe Connect transfer (take 25% service fee)
            #    Transfer to passenger's connected account (we assume we have their Stripe account ID)
            passenger_stripe_account = "acct_xyz"  # fetch from DB
            service_fee = int(payout * 0.25)
            net_payout = payout - service_fee
            try:
                transfer = stripe.Transfer.create(
                    amount=net_payout * 100,  # cents
                    currency="eur",
                    destination=passenger_stripe_account,
                    transfer_group=f"claim_{claim.id}",
                )
                logger.info(f"Stripe transfer {transfer.id} for {net_payout} EUR")
                claim.stripe_transfer_id = transfer.id
                claim.status = "paid"
                async with async_session() as db:
                    db.add(claim)
                    await db.commit()
            except stripe.error.StripeError as e:
                logger.error(f"Stripe transfer failed: {e}")
                claim.status = "payment_failed"
                async with async_session() as db:
                    db.add(claim)
                    await db.commit()
                # Could retry later

            # 6. Publish event to claim_processed topic (for notifications)
            await kafka_producer.send(
                topic=settings.KAFKA_CLAIM_TOPIC,
                value={
                    "claim_id": claim.id,
                    "passenger_id": claim.passenger_id,
                    "status": claim.status,
                    "payout": claim.payout_amount
                }
            )

            # 7. Record event in EventStore (CQRS / Event Sourcing)
            event_store = EventStore()
            await event_store.append_event(
                aggregate_id=f"claim_{claim.id}",
                event_type="ClaimProcessed",
                data={
                    "claim_id": claim.id,
                    "payout": payout,
                    "service_fee": service_fee,
                    "status": claim.status
                }
            )

        except Exception as e:
            logger.exception(f"Error processing delay message: {e}")

    async def run(self):
        await self.start_consuming(self.process_message)

# Singleton instance to be started in a background task
delay_processor = DelayProcessor()
