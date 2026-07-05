from typing import List, Dict
from app.models.ride import Ride
import uuid

class RideHailingService:
    async def get_available_vehicles(self, pickup: str, dropoff: str) -> List[Dict]:
        # Mock Uber/Lyft API response
        return [
            {"id": "v1", "name": "UberXL", "cargo_volume": 80, "cargo_weight": 100},
            {"id": "v2", "name": "Lyft SUV", "cargo_volume": 60, "cargo_weight": 80},
            {"id": "v3", "name": "Sedan", "cargo_volume": 30, "cargo_weight": 50}
        ]

    async def book_ride(self, vehicle: Dict, pickup: str, dropoff: str, extra_fee: float) -> Ride:
        # Mock booking
        ride = Ride(id=str(uuid.uuid4()), vehicle=vehicle["name"], total_fee=10 + extra_fee)
        return ride
