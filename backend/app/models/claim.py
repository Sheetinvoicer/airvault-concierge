from sqlalchemy import Column, String, Integer, Float, Text, DateTime
from app.db.base import Base

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True)
    flight_id = Column(String)
    passenger_id = Column(String)
    airline = Column(String)
    delay_minutes = Column(Integer)
    payout_amount = Column(Float)
    status = Column(String)
    claim_letter = Column(Text)
    stripe_transfer_id = Column(String)
    created_at = Column(DateTime)
