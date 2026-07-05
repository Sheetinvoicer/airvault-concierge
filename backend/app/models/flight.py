from sqlalchemy import Column, String, DateTime, Float
from app.db.base import Base

class Flight(Base):
    __tablename__ = "flights"
    id = Column(String, primary_key=True)
    airline = Column(String)
    origin = Column(String)
    destination = Column(String)
    departure = Column(DateTime)
    arrival = Column(DateTime)
    price = Column(Float)
