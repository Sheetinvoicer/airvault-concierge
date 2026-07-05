from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Optional
from app.services.flight_tracker import FlightTracker
from app.core.pricing import apply_concierge_fee
from app.schemas.request import FlightSearchRequest
from app.schemas.response import FlightResponse
from app.dependencies import get_flight_tracker
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/search")
async def search_flights(req: FlightSearchRequest, tracker: FlightTracker = Depends(get_flight_tracker)):
    """Search for last‑minute flights (<48h) and apply dynamic pricing."""
    flights = await tracker.search_last_minute(req.origin, req.destination, req.departure_date)
    # Apply 7% concierge fee
    for f in flights:
        f["price"] = apply_concierge_fee(f["price"])
    return {"flights": flights}

@router.get("/live/{flight_id}")
async def get_live_status(flight_id: str, tracker: FlightTracker = Depends(get_flight_tracker)):
    """Get real‑time status of a specific flight (cached)."""
    status = await tracker.get_flight_status(flight_id)
    if not status:
        raise HTTPException(404, "Flight not found")
    return status
