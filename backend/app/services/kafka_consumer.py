import json
import logging
from typing import Callable, Awaitable, Optional

logger = logging.getLogger(__name__)

class KafkaConsumerBase:
    def __init__(self, topic: str, group_id: str, bootstrap_servers: Optional[str]):
        self._bootstrap_servers = bootstrap_servers
        self._topic = topic
        self._group_id = group_id
        self.consumer = None
        if bootstrap_servers:
            from aiokafka import AIOKafkaConsumer
            self.consumer = AIOKafkaConsumer(
                topic,
                group_id=group_id,
                bootstrap_servers=bootstrap_servers,
                value_deserializer=lambda x: json.loads(x.decode())
            )

    async def start_consuming(self, callback: Callable[[dict], Awaitable[None]]):
        if self.consumer is None:
            logger.info("Kafka consumer disabled (no KAFKA_BOOTSTRAP_SERVERS), skipping %s", self._topic)
            return
        await self.consumer.start()
        try:
            async for msg in self.consumer:
                await callback(msg.value)
        finally:
            await self.consumer.stop()
