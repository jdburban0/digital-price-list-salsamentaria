from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from typing import Optional
from app.db import SessionLocal, UserDB

router = APIRouter(prefix="/register", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CODIGO SECRETO
INVITE_CODE = "BUrBAN02o25"

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

@router.post("")
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    # Verificar código de invitación
    if payload.invite_code != INVITE_CODE:
        raise HTTPException(status_code=403, detail="Código de invitación inválido")
    
    existing = db.query(UserDB).filter(UserDB.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="El usuario ya existe")
    
    existing_email = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    hashed_pw = pwd_context.hash(payload.password)
    new_user = UserDB(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed_pw,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Usuario creado con éxito", "username": new_user.username}