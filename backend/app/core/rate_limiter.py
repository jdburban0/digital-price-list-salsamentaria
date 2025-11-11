from collections import defaultdict, deque
from threading import Lock
from time import time
from typing import Deque

from fastapi import HTTPException, Request, status


class RateLimiter:
    """Dependencia simple de rate limiting en memoria."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, Deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def __call__(self, request: Request) -> None:
        client_ip = request.client.host if request.client else "anonymous"
        current_time = time()

        with self._lock:
            history = self._requests[client_ip]

            # Limpia solicitudes fuera de la ventana
            while history and current_time - history[0] > self.window_seconds:
                history.popleft()

            if len(history) >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Demasiados intentos. Intenta de nuevo en un minuto.",
                )

            history.append(current_time)


__all__ = ["RateLimiter"]
