import strawberry
from strawberry.fastapi import GraphQLRouter
from app.services.meal_orchestrator import MealOrchestrator
from app.dependencies import get_meal_orchestrator
from typing import List, Optional

@strawberry.type
class Meal:
    id: str
    name: str
    description: str
    available: bool

@strawberry.type
class MealReservation:
    booking_ref: str
    meal_id: str
    seat_number: str
    confirmed: bool

@strawberry.type
class Query:
    @strawberry.field
    async def available_meals(self, flight_id: str) -> List[Meal]:
        orchestrator = get_meal_orchestrator()
        return await orchestrator.get_available_meals(flight_id)

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def reserve_meal(self, flight_id: str, meal_id: str, seat_number: str) -> MealReservation:
        orchestrator = get_meal_orchestrator()
        return await orchestrator.reserve_meal(flight_id, meal_id, seat_number)

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema)
