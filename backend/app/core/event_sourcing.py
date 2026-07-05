import json
from typing import List, Dict
from datetime import datetime
from app.db.session import async_session
from app.models.event import Event

class EventStore:
    async def append_event(self, aggregate_id: str, event_type: str, data: dict):
        async with async_session() as db:
            event = Event(
                aggregate_id=aggregate_id,
                event_type=event_type,
                data=json.dumps(data),
                occurred_at=datetime.utcnow()
            )
            db.add(event)
            await db.commit()

    async def get_events(self, aggregate_id: str) -> List[Dict]:
        async with async_session() as db:
            from sqlalchemy import select
            stmt = select(Event).where(Event.aggregate_id == aggregate_id).order_by(Event.occurred_at)
            result = await db.execute(stmt)
            events = result.scalars().all()
            return [{"type": e.event_type, "data": json.loads(e.data), "time": e.occurred_at} for e in events]
