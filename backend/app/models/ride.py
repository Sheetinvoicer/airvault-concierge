from sqlalchemy import Column, String, Float
from app.db.base import Base

class Ride(Base):
    __tablename__ = "rides"
    id = Column(String, primary_key=True)
    vehicle = Column(String)
    total_fee = Column(Float)
