from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.db import SessionLocal, UserDB
from app.core.config import settings
from collections import deque
import time

router = APIRouter(prefix="/register", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    invite_code: str


# Limitador simple para registro por IP
_attempts_reg: dict[str, deque[float]] = {}
_RL_MAX = settings.RATE_LIMIT_MAX_ATTEMPTS
_RL_WIN = settings.RATE_LIMIT_WINDOW_SECONDS


def _check_rate_limit_reg(key: str):
    now = time.monotonic()
    dq = _attempts_reg.setdefault(key, deque())
    cutoff = now - _RL_WIN
    while dq and dq[0] < cutoff:
        dq.popleft()
    if len(dq) >= _RL_MAX:
        raise HTTPException(status_code=429, detail="Too many attempts, try later")
    dq.append(now)


@router.post("")
def register_user(request: Request, payload: UserCreate, db: Session = Depends(get_db)):
    # Limitar por IP
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit_reg(f"register:{client_ip}")
    # Verificar codigo de invitacion
    if payload.invite_code != settings.INVITE_CODE:
        raise HTTPException(status_code=403, detail="Codigo de invitacion invalido")

    existing = db.query(UserDB).filter(UserDB.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="El usuario ya existe")

    existing_email = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="El correo ya esta registrado")

    hashed_pw = pwd_context.hash(payload.password)
    new_user = UserDB(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed_pw,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Usuario creado con exito", "username": new_user.username}
