from sqlalchemy import Column, String, Boolean
from app.db.base import Base

class Meal(Base):
    __tablename__ = "meals"
    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(String)
    available = Column(Boolean)
