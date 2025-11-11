# Digital Price List — Salsamentaría Burbano

Aplicación web full-stack para administrar y publicar la lista de precios de una salsamentaría. Incluye autenticación con JWT, panel administrativo protegido, control de catálogo (productos, categorías, proveedores), gestión de clientes y pedidos y un listado público optimizado para consulta.

## Arquitectura

| Capa        | Tecnología | Descripción |
| ----------- | ---------- | ----------- |
| Frontend    | React + Vite | SPA con React Router, componentes reutilizables y consumo de la API vía `fetch`. |
| Backend     | FastAPI | API REST con validaciones Pydantic, seguridad JWT y limitador de peticiones. |
| Persistencia| SQLite (SQLAlchemy) | ORM declarativo con relaciones 1:N entre entidades (categorías ↔ productos, proveedores ↔ productos, clientes ↔ pedidos). |

## Funcionalidades Clave

- Registro y autenticación con JWT (código de invitación configurable).
- Rate limiting en `/login` para prevenir ataques de fuerza bruta.
- CRUD completo para 4 entidades relacionadas: Productos, Categorías, Proveedores, Clientes y gestión de Pedidos.
- Relación de pedidos con clientes y productos, actualización de estado y notas.
- Frontend con panel administrativo (gestión privada) y vista pública del catálogo.
- Semillas automáticas para categorías, proveedores y clientes de ejemplo.
- Documentación automática de la API en `/docs` (OpenAPI).

## Requisitos Previos

- [uv](https://docs.astral.sh/uv/latest/) (gestor de entornos y dependencias Python) ✅
- Python 3.11+
- Node.js 20+ y npm 10+

## Configuración de Entorno

1. Copia el archivo de variables y personaliza según sea necesario:

   ```bash
   cp .env.example .env
   ```

2. Variables destacadas:

   - `DATABASE_URL`: conexión SQLite por defecto (`sqlite:///./products.db`).
   - `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`: parámetros del token.
   - `INVITE_CODE`: código requerido para crear cuentas desde el frontend.
   - `VITE_API_URL`: URL base del backend consumida por React.

## Puesta en Marcha

### Backend (FastAPI)

```bash
cd backend
uv venv .venv
source .venv/bin/activate   # En Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload --port 8000
```

- API disponible en `http://127.0.0.1:8000`
- Documentación interactiva: `http://127.0.0.1:8000/docs`

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

- Aplicación en `http://localhost:5173`
- Asegúrate de que `VITE_API_URL` apunte al backend (por defecto `http://127.0.0.1:8000`).

## Endpoints Principales

| Método | Ruta | Descripción | Seguridad |
| ------ | ---- | ----------- | --------- |
| POST | `/register` | Alta de usuarios mediante código de invitación | Público |
| POST | `/login` | Autenticación, retorna JWT (`Authorization: Bearer`) | Rate limited |
| GET | `/products` | Lista de productos con búsqueda, orden y paginación | Público |
| POST/PUT/DELETE | `/products` | CRUD de productos | Requiere JWT |
| GET/POST/PUT/DELETE | `/categories` | CRUD de categorías | GET público / resto JWT |
| GET/POST/PUT/DELETE | `/suppliers` | CRUD de proveedores | GET público / resto JWT |
| GET/POST/PUT/DELETE | `/customers` | CRUD de clientes | Requiere JWT |
| GET/POST/PUT/DELETE | `/orders` | Gestión de pedidos (cliente, producto, estado) | Requiere JWT |

Las respuestas utilizan modelos Pydantic coherentes y errores manejados (`400/401/404/409/422/429`).

## Seguridad

- **JWT**: tokens firmados con HS256, expiración configurable.
- **Rate limiting**: máximo 5 intentos/minuto por IP en `/login`.
- **Validaciones**: reglas de unicidad (correo de clientes, nombre de producto), tipos y rangos definidos en modelos Pydantic.
- **CORS**: habilitado sólo para orígenes permitidos (`http://localhost:5173`, `http://127.0.0.1:5173`).

## Frontend Destacado

- Panel administrativo con pestañas para categorías, proveedores y clientes.
- Gestión de pedidos con creación, actualización de estado y notas.
- Estadísticas en tiempo real (productos, clientes, pedidos).
- Vista pública para consulta rápida del catálogo y filtros por categoría.
- Tema claro/oscuro persistente mediante `localStorage`.

## Pruebas

Pruebas de API con `pytest` (`backend/tests/test_api.py`) cubren:

- Autenticación y obtención de token.
- CRUD de productos, clientes y pedidos.
- Validaciones de negocio (duplicados, cambios de estado).

Ejecutar pruebas:

```bash
cd backend
uv run pytest
```

## Datos Semilla

Al iniciar el backend se generan automáticamente categorías, proveedores y clientes de ejemplo. También se crea el usuario `admin` (contraseña `1234`) para facilitar las primeras pruebas.

## Capturas / Demo

Incluye tus capturas o un video corto en la carpeta del repositorio o enlaza en la presentación final.

---

¿Dudas? Revisa la documentación en `/docs` o consulta los comentarios incluidos en los módulos clave del backend.
