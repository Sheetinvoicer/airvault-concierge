from sqlalchemy import Column, String, DateTime
from app.db.base import Base

class PetChecklist(Base):
    __tablename__ = "pet_checklists"
    id = Column(String, primary_key=True)
    origin = Column(String)
    destination = Column(String)
    owner = Column(String)
    pet_name = Column(String)
    generated_at = Column(DateTime)
