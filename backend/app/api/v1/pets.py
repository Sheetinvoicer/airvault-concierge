from fastapi import APIRouter, Depends, HTTPException
from app.services.pet_compliance import PetComplianceService
from app.schemas.request import PetChecklistRequest
from app.dependencies import get_pet_service
from fastapi.responses import Response

router = APIRouter()

@router.post("/checklist")
async def generate_checklist(req: PetChecklistRequest, service: PetComplianceService = Depends(get_pet_service)):
    requirements = await service.get_requirements(req.origin, req.destination)
    pdf_bytes = await service.generate_pdf(req.origin, req.destination, req.owner_name, req.pet_name)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=pet_checklist.pdf"})
