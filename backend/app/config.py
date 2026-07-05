from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    KAFKA_BOOTSTRAP_SERVERS: Optional[str] = None   # optional — leave blank without Upstash Kafka
    STRIPE_SECRET_KEY: str
    RAPIDAPI_KEY: str
    JWT_SECRET: str = "change-me-in-production"
    CORS_ORIGINS: list = ["https://app.awsaftrading.com", "*"]
    ALLOWED_HOSTS: list = ["*"]
    KAFKA_DELAY_TOPIC: str = "flight-delays"
    KAFKA_CLAIM_TOPIC: str = "claim-processed"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
