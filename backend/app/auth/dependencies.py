from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import SessionLocal, UserDB

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# Dependencia para obtener sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Crear usuario (para inicializar el admin si no existe)
def create_admin_user(db: Session):
    admin = db.query(UserDB).filter(UserDB.username == "admin").first()
    if not admin:
        hashed_pw = pwd_context.hash("1234")
        new_admin = UserDB(username="admin", email="admin@salsamentaria.com", hashed_password=hashed_pw)
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_username(db: Session, username: str):
    return db.query(UserDB).filter(UserDB.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(db, username)
    if user is None:
        raise credentials_exception

    return user
