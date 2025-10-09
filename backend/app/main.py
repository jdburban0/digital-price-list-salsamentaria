from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuración base y rutas API
from app.core.config import settings
from app.api.routes.products import router as products_router
from app.api.routes.categories import router as categories_router
from app.api.routes.suppliers import router as suppliers_router

# Autenticación
from app.auth.auth import router as auth_router
from app.auth.register import router as register_router

# Base de datos
from app.db import init_db, seed_data

# ---------------------------------------------------------------

app = FastAPI(title="Digital Price List API")


# Crear tablas (incluye UserDB)
init_db()
seed_data()

# ---------------------------------------------------------------
# Configurar CORS para que el frontend (React) pueda acceder
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],  # NECESARIO para leer el total desde el frontend
)



# ---------------------------------------------------------------
# Incluir rutas
app.include_router(auth_router)       # /login
app.include_router(register_router)   # /register
# app.include_router(change_password_router)  # opcional futuro
app.include_router(products_router)   # /products
app.include_router(categories_router) # /categories
app.include_router(suppliers_router)  # /suppliers

# ---------------------------------------------------------------
# Endpoint raíz
@app.get("/")
async def root():
    return {"message": "Digital Price List API funcionando correctamente"}



