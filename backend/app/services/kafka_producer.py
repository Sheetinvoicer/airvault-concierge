import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class KafkaProducer:
    def __init__(self):
        self._producer = None

    async def start(self):
        if not settings.KAFKA_BOOTSTRAP_SERVERS:
            logger.info("KAFKA_BOOTSTRAP_SERVERS not set — producer disabled.")
            return
        from aiokafka import AIOKafkaProducer
        self._producer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS)
        await self._producer.start()

    async def send(self, topic: str, value: dict):
        if self._producer is None:
            logger.debug("Kafka producer not available, skipping send to %s", topic)
            return
        await self._producer.send(topic, json.dumps(value).encode())

    async def stop(self):
        if self._producer is not None:
            await self._producer.stop()

kafka_producer = KafkaProducer()
