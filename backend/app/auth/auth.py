from datetime import datetime, timedelta
from typing import Optional
from collections import deque
import time
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.auth.dependencies import (
    SECRET_KEY,
    ALGORITHM,
    authenticate_user,
    get_db,
    create_admin_user,
    get_current_user,
)
from app.core.config import settings

router = APIRouter(prefix="/login", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Limitador simple en memoria por clave
_attempts: dict[str, deque[float]] = {}
_RL_MAX = settings.RATE_LIMIT_MAX_ATTEMPTS
_RL_WIN = settings.RATE_LIMIT_WINDOW_SECONDS


def _prune_and_get_queue(key: str) -> deque:
    now = time.monotonic()
    dq = _attempts.setdefault(key, deque())
    cutoff = now - _RL_WIN
    while dq and dq[0] < cutoff:
        dq.popleft()
    return dq


def _check_rate_limit(key: str):
    dq = _prune_and_get_queue(key)
    if len(dq) >= _RL_MAX:
        # Indicar al cliente cuánto esperar como pista
        raise HTTPException(status_code=429, detail="Muchos intentos fallidos, intenta más tarde.", headers={"Retry-After": str(_RL_WIN)})


def _record_failed_attempt(key: str):
    now = time.monotonic()
    dq = _attempts.setdefault(key, deque())
    dq.append(now)


def _client_ip(request: Request) -> str:
    # Respeta cabecera de proxy si existe
    xff = request.headers.get("x-forwarded-for")
    if xff:
        ip = xff.split(",")[0].strip()
        if ip:
            return ip
    return request.client.host if request.client else "unknown"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Limitar por usuario + IP (solo cuenta intentos fallidos)
    client_ip = _client_ip(request)
    key = f"login:{form_data.username}:{client_ip}" if getattr(form_data, "username", None) else f"login:{client_ip}"
    _check_rate_limit(key)

    # Garantiza que exista el admin por defecto (después de chequear límite)
    create_admin_user(db)

    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        _record_failed_attempt(key)
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def me(user=Depends(get_current_user)):
    return {"id": user.id, "username": user.username, "email": user.email}
