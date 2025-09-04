from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings  # pylint: disable=E0611,E0401
from app.api.routes.products import router as products_router  # pylint: disable=E0611,E0401

app = FastAPI(title="Digital Price List API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(products_router)


@app.get("/")
async def root():
    return {"message": "Digital Price List API"}
