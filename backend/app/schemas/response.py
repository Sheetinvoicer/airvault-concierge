from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FlightResponse(BaseModel):
    id: str
    airline: str
    departure: datetime
    arrival: datetime
    price: float
    currency: str

class ClaimResponse(BaseModel):
    id: int
    flight_id: str
    passenger_id: str
    status: str
    payout: float

class RideResponse(BaseModel):
    ride_id: str
    vehicle: str
    fee: float

class Meal(BaseModel):
    id: str
    name: str
    description: str
    available: bool

class MealReservation(BaseModel):
    booking_ref: str
    meal_id: str
    seat_number: str
    confirmed: bool
