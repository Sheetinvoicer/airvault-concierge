from sqlalchemy import Column, Integer, String, Text, DateTime
from app.db.base import Base

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    aggregate_id = Column(String)
    event_type = Column(String)
    data = Column(Text)
    occurred_at = Column(DateTime)
