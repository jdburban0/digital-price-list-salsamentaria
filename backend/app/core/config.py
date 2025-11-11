from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Aplicacion / Seguridad
    SECRET_KEY: str = "supersecreto123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Limitacion de rate (para endpoints criticos como /login)
    RATE_LIMIT_MAX_ATTEMPTS: int = 5
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # Codigo de invitacion para registro (control de acceso basico)
    INVITE_CODE: str = "BUrBAN02o25"

    # Base de datos
    DATABASE_URL: str = "sqlite:///./products.db"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]):
        if isinstance(v, str):
            # Acepta una cadena separada por comas desde el entorno
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    model_config = {
        "env_file": (".env", "../.env"),
        "env_file_encoding": "utf-8",
    }


settings = Settings()
