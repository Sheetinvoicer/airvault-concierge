from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.flight_tracker import FlightTracker
import json
import asyncio

router = APIRouter()
tracker = FlightTracker()

@router.websocket("/flight-track")
async def websocket_flight_track(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Broadcast real‑time flight statuses to connected clients
            status = await tracker.get_broadcast_update()
            await websocket.send_text(json.dumps(status))
            await asyncio.sleep(5)  # update every 5s
    except WebSocketDisconnect:
        pass
