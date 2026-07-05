import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.api.v1 import flights, claims, rides, pets, websocket as ws_router
from app.api.v1.meals import graphql_app  # <-- NEW import
from app.middleware.freemium import FreemiumMiddleware
from app.config import settings
from app.db.session import init_db, close_db
from app.utils.circuit_breaker import register_circuit_breakers
from app.services.kafka_producer import kafka_producer
from prometheus_fastapi_instrumentator import Instrumentator
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await register_circuit_breakers()
    await kafka_producer.start()
    if settings.KAFKA_BOOTSTRAP_SERVERS:
        from app.consumers.delay_processor import delay_processor
        asyncio.create_task(delay_processor.run())
        logger.info("Kafka consumer started.")
    else:
        logger.info("Kafka disabled — consumer not started.")
    logger.info("AirVault Concierge started.")
    yield
    await kafka_producer.stop()
    await close_db()
    logger.info("Shutting down.")

app = FastAPI(
    title="AirVault Concierge API",
    version="1.0.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(FreemiumMiddleware)

# REST routers
app.include_router(flights.router, prefix="/api/v1/flights", tags=["flights"])
app.include_router(claims.router, prefix="/api/v1/claims", tags=["claims"])
app.include_router(rides.router, prefix="/api/v1/rides", tags=["rides"])
app.include_router(pets.router, prefix="/api/v1/pets", tags=["pets"])
app.include_router(ws_router.router, prefix="/ws", tags=["websocket"])

# GraphQL (Strawberry) – mounted at /graphql
app.mount("/graphql", graphql_app)   # <-- NEW

# Prometheus metrics endpoint – scraped by prometheus at /metrics
Instrumentator().instrument(app).expose(app)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
