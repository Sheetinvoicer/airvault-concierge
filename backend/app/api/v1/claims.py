from fastapi import APIRouter, Depends, HTTPException
from app.services.compensation import CompensationService
from app.core.event_sourcing import EventStore
from app.schemas.request import ClaimRequest
from app.schemas.response import ClaimResponse
from app.dependencies import get_compensation_service, get_event_store
from typing import List

router = APIRouter()

@router.post("/")
async def create_claim(req: ClaimRequest, service: CompensationService = Depends(get_compensation_service)):
    """Manually trigger a claim (or used by Kafka consumer)."""
    claim = await service.process_claim(req.flight_id, req.passenger_id, req.delay_minutes)
    return ClaimResponse.from_orm(claim)

@router.get("/{claim_id}")
async def get_claim(claim_id: int, event_store: EventStore = Depends(get_event_store)):
    """Get claim details and event history (CQRS read)."""
    events = await event_store.get_events(f"claim_{claim_id}")
    return {"events": events}

@router.get("/user/{user_id}")
async def get_user_claims(user_id: str, service: CompensationService = Depends(get_compensation_service)):
    return await service.get_claims_for_user(user_id)
