from pybreaker import CircuitBreaker, CircuitBreakerError
import asyncio

breakers = {}

def circuit_breaker(name: str):
    if name not in breakers:
        breakers[name] = CircuitBreaker(fail_max=5, reset_timeout=60)
    return breakers[name]

async def register_circuit_breakers():
    # Placeholder
    pass
