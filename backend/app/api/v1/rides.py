from fastapi import APIRouter, Depends, HTTPException
from app.services.ride_hailing import RideHailingService
from app.core.ride_matching import match_vehicle
from app.schemas.request import RideRequest
from app.schemas.response import RideResponse
from app.dependencies import get_ride_service

router = APIRouter()

@router.post("/request")
async def request_ride(req: RideRequest, service: RideHailingService = Depends(get_ride_service)):
    # Filter vehicles by luggage capacity
    vehicles = await service.get_available_vehicles(req.pickup, req.dropoff)
    matched = match_vehicle(vehicles, req.luggage_volume, req.luggage_weight)
    if not matched:
        raise HTTPException(400, "No vehicle matches luggage requirements")
    # Add convenience fee: $0.50 per lb over 20lbs
    extra_fee = max(0, (req.luggage_weight - 20) * 0.5)
    ride = await service.book_ride(matched, req.pickup, req.dropoff, extra_fee)
    return RideResponse(ride_id=ride.id, vehicle=matched.name, fee=ride.total_fee)
