from sqlalchemy import Column, String, Boolean, DateTime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime)
