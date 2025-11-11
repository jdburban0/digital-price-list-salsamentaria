from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuración base y rutas API
from app.core.config import settings
from app.api.routes.products import router as products_router
from app.api.routes.categories import router as categories_router
from app.api.routes.suppliers import router as suppliers_router
from app.api.routes.customers import router as customers_router
from app.api.routes.orders import router as orders_router

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
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],  # NECESARIO para leer el total desde el frontend
)


# ---------------------------------------------------------------
# Incluir rutas
app.include_router(auth_router)  # /login
app.include_router(register_router)  # /register
app.include_router(products_router)  # /products
app.include_router(categories_router)  # /categories
app.include_router(suppliers_router)  # /suppliers
app.include_router(customers_router)  # /customers
app.include_router(orders_router)  # /orders


# ---------------------------------------------------------------
# Endpoint raíz
@app.get("/")
async def root():
    return {"message": "Digital Price List API funcionando correctamente"}
