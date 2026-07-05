from pydantic import BaseModel
from datetime import date

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date

class ClaimRequest(BaseModel):
    flight_id: str
    passenger_id: str
    delay_minutes: int

class RideRequest(BaseModel):
    pickup: str
    dropoff: str
    luggage_volume: float  # liters
    luggage_weight: float  # lbs

class PetChecklistRequest(BaseModel):
    origin: str
    destination: str
    owner_name: str
    pet_name: str
