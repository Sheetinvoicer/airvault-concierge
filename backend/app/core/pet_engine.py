import asyncio
import aiohttp
import re
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from pydantic import BaseModel, Field
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.utils.circuit_breaker import CircuitBreaker, circuit_breaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class PetTravelRequirements(BaseModel):
    origin_iso: str
    destination_iso: str
    microchip_required: bool
    rabies_titer_deadline: datetime  # absolute deadline
    health_certificate_validity_days: int
    additional_documents: List[str]
    steps: List[str]  # step-by-step checklist

class PetComplianceEngine:
    """Dynamic IATA/APHIS scraper and PDF generator for pet travel."""
    
    def __init__(self):
        self.cache = {}  # simple in-memory cache; could use Redis
        self.session: aiohttp.ClientSession = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, *args):
        await self.session.close()

    @circuit_breaker("pet_scraper")
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10),
           retry=retry_if_exception_type(aiohttp.ClientError))
    async def fetch_requirements(self, origin: str, destination: str) -> PetTravelRequirements:
        """Scrape IATA and APHIS/TRACES for pet travel rules."""
        cache_key = f"{origin}_{destination}"
        if cache_key in self.cache:
            logger.info(f"Cache hit for {cache_key}")
            return self.cache[cache_key]

        # Simulate scraping logic – in production, use proper HTML parsers (BeautifulSoup) and APIs.
        # For demonstration, we construct a plausible response.
        # Real implementation would call:
        #   - IATA Traveler's Pet Corner: https://www.iata.org/en/services/cargo/pets/
        #   - APHIS: https://www.aphis.usda.gov/aphis/pet-travel
        #   - EU TRACES: https://ec.europa.eu/food/animals/traces_en

        # We'll simulate with country‑pair specific rules (e.g., US->GB, US->EU).
        # In reality, we would scrape and parse.

        # Simulated logic based on origin/destination.
        if origin == "US" and destination == "GB":
            microchip = True
            # Rabies titer test must be done at least 21 days before travel, valid 1 year.
            deadline = datetime.utcnow() + timedelta(days=21)
            health_validity = 10  # days
            additional = ["Pet passport", "UK health certificate"]
            steps = [
                "1. Ensure cat is microchipped (ISO 11784/11785).",
                "2. Vaccinate against rabies and obtain titer test (FAVN) at least 21 days prior.",
                "3. Obtain health certificate from USDA‑accredited vet within 10 days of travel.",
                "4. Submit paperwork to APHIS for endorsement.",
                "5. Book with airline and present documents at check‑in."
            ]
        elif origin == "US" and destination == "FR":
            microchip = True
            deadline = datetime.utcnow() + timedelta(days=30)
            health_validity = 10
            additional = ["EU Health Certificate", "Rabies titer test"]
            steps = [
                "1. Microchip (ISO compliant).",
                "2. Rabies vaccination + titer test (at least 30 days after vaccination).",
                "3. EU health certificate signed by official vet within 10 days.",
                "4. Submit to APHIS for endorsement.",
                "5. Enter via designated point of entry."
            ]
        else:
            # Default rules (simple)
            microchip = True
            deadline = datetime.utcnow() + timedelta(days=14)
            health_validity = 10
            additional = ["General health certificate"]
            steps = [
                "1. Microchip.",
                "2. Rabies vaccination.",
                "3. Health certificate.",
                "4. Check airline pet policy."
            ]

        req = PetTravelRequirements(
            origin_iso=origin,
            destination_iso=destination,
            microchip_required=microchip,
            rabies_titer_deadline=deadline,
            health_certificate_validity_days=health_validity,
            additional_documents=additional,
            steps=steps
        )

        self.cache[cache_key] = req
        logger.info(f"Cached requirements for {cache_key}")
        return req

    async def generate_pdf_checklist(self, req: PetTravelRequirements, owner_name: str, pet_name: str) -> bytes:
        """Generate a PDF checklist using ReportLab."""
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Title
        c.setFont("Helvetica-Bold", 16)
        c.drawString(1*inch, height - 1*inch, f"Pet Travel Checklist for {pet_name}")

        # Owner info
        c.setFont("Helvetica", 12)
        y = height - 1.5*inch
        c.drawString(1*inch, y, f"Owner: {owner_name}")
        y -= 0.3*inch
        c.drawString(1*inch, y, f"Origin: {req.origin_iso}  →  Destination: {req.destination_iso}")

        # Microchip
        y -= 0.4*inch
        c.drawString(1*inch, y, f"Microchip required: {'Yes' if req.microchip_required else 'No'}")

        # Rabies titer deadline
        y -= 0.3*inch
        deadline_str = req.rabies_titer_deadline.strftime("%Y-%m-%d %H:%M UTC")
        c.drawString(1*inch, y, f"Rabies titer deadline: {deadline_str}")

        # Health certificate validity
        y -= 0.3*inch
        c.drawString(1*inch, y, f"Health certificate validity: {req.health_certificate_validity_days} days")

        # Additional docs
        y -= 0.4*inch
        c.drawString(1*inch, y, "Additional documents:")
        y -= 0.2*inch
        for doc in req.additional_documents:
            c.drawString(1.5*inch, y, f"• {doc}")
            y -= 0.2*inch

        # Steps
        y -= 0.3*inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y, "Step‑by‑Step Checklist:")
        y -= 0.3*inch
        c.setFont("Helvetica", 12)
        for step in req.steps:
            c.drawString(1*inch, y, step)
            y -= 0.2*inch
            if y < 1*inch:  # new page if needed
                c.showPage()
                c.setFont("Helvetica", 12)
                y = height - 1*inch

        c.save()
        buffer.seek(0)
        return buffer.getvalue()

# Singleton instance
pet_engine = PetComplianceEngine()
