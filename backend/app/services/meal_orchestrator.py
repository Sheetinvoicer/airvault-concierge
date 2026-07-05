from typing import List, Dict
from app.schemas.response import Meal, MealReservation

class MealOrchestrator:
    async def get_available_meals(self, flight_id: str) -> List[Meal]:
        # Mock – call catering partner GraphQL
        return [
            Meal(id="m1", name="Chicken Breast", description="Grilled", available=True),
            Meal(id="m2", name="Vegetarian Pasta", description="Organic", available=True)
        ]

    async def reserve_meal(self, flight_id: str, meal_id: str, seat_number: str) -> MealReservation:
        # Mock reservation – background task (Celery)
        return MealReservation(booking_ref="BK123", meal_id=meal_id, seat_number=seat_number, confirmed=True)
