# Salsamentaría Burbano — Digital Price List (MVP Semana 11)
## Elevator Pitch

En una salsamentaria tradicional, el propietario debe imprimir listas de precios constantemente para mantenerlas actualizadas, lo que genera desperdicio de papel, tiempo y errores manuales.
Esta aplicación web permite al propietario gestionar precios de productos en tiempo real, desde PC o celular, con un login seguro y una interfaz moderna.

Dirigida a pequeños negocios como salsamentarias, reduce costos y mejora la eficiencia operativa, permitiendo actualizar precios fácilmente y que los clientes consulten la lista actualizada.


## Usuario Principal (Propietario/Administrador): 
* Crear, editar y eliminar productos.

* Iniciar sesión (login protegido con JWT).

* Gestionar categorías y proveedores.Dueño de la salsamentaria (ej. la tía del usuario). Casos de uso: Crear/actualizar/eliminar productos con precios, buscar productos, ordenar lista por nombre o precio.

## Usuario Secundario (Cliente): 
* Consultar la lista pública de precios.

* Buscar y filtrar productos sin autenticación.

# Objetivos y No-Objetivos

## Objetivos:

* Implementar un MVP funcional con CRUD completo de productos, categorías y proveedores.

* Añadir autenticación JWT, protección de rutas y rate limiting.

* Integrar SQLite como base de datos persistente.

* Proporcionar una interfaz clara y responsive.


## No-Objetivos (explícitamente no se hará en MVP):

* No se implementan roles múltiples ni multiusuario.

* No se incluyen reportes PDF o notificaciones.

* No se implementa despliegue en la nube (solo entorno local).



## Métricas/KPIs de Successo

* CRUD y autenticación responden en menos de 500ms.

* UI carga productos en menos de 2 segundos.

* Flujo completo: login → CRUD → logout funcional.

* Manejo de errores controlado (401, 404, 409, 422, 429).

* Éxito: El dueño actualiza precios en menos de 1 minuto sin errores.

# Instrucciones para Ejecutar Backend y Frontend

Requisitos Previos

Instalar uv (gestor de paquetes Python): Sigue las instrucciones en la sección 7.1 del documento de asignatura.
Node.js y npm para frontend.

Backend (FastAPI)

cd backend
uv venv .venv
Activar venv:

macOS/Linux: source .venv/bin/activate
Windows: .venv\Scripts\Activate.ps1


uv pip install -r requirements.txt
uv run uvicorn app.main:app --reload --port 8000

Accede a Swagger UI: http://127.0.0.1:8000/docs



Frontend (React + Vite)

1. cd frontend
2. npm install
3. Crear/editar .env.development con: VITE_API_URL=http://127.0.0.1:8000
4. npm run dev

* Accede a la app: http://localhost:5173



Variables de Entorno y Puertos

* Backend: Puerto 8000 (configurable en uvicorn).
* Frontend: Puerto 5173 (predeterminado de Vite).
* VITE_API_URL: URL base de la API (ej. http://127.0.0.1:8000).

# Roadmap:

## Semana 6 (Completada - Entregable 1)

## Realizado:

Vertical slice con entidad Producto (CRUD completo: POST, GET, PUT, DELETE).
Búsqueda con debounce (300ms) en la UI.
Estados de carga y error en el frontend.
Prueba backend mínima pasando (crear producto).
Documentación inicial (README, ERD, API design).


## Semana 7

## Reañozado 

Objetivo: Refinar la UI y preparar la transición a base de datos.
Tareas:

Mejorar estilos en App.css (responsividad, consistencia visual).
Añadir validaciones frontend (e.j., mostrar errores de categoria vacía antes de enviar).
Investigar y configurar SQLite como base de datos (reemplazar _db in-memory en products.py).
Crear migraciones iniciales para la tabla Producto (nombre, precio, categoria).


Deliverable: Commit con UI mejorada y esquema de base de datos básico.

## Semana 8

## Realizado

Objetivo: Integrar base de datos y pruebas adicionales.
Tareas:

Implementar conexión a SQLite en el backend (usar SQLAlchemy o una librería ligera como aiosqlite).
Migrar lógica de CRUD a usar la base de datos (reemplazar _db).
Añadir pruebas backend para GET /products, PUT /products/{id}, y DELETE /products/{id}.
Actualizar documentación (ERD con base de datos, instrucciones de instalación con SQLite).


Deliverable: Backend funcionando con SQLite, al menos 4 pruebas pasando.

## Semana 9

## Realizado

Objetivo: Añadir funcionalidad de paginación y ordenamiento avanzado.
Tareas:

Implementar paginación en la UI (mostrar "Siguiente" y "Anterior" con offset y limit).
Añadir ordenamiento por categoria en el backend (sort=categoria).
Optimizar búsqueda con índices en la base de datos (si es necesario).
Refinar manejo de errores (e.g., mensajes personalizados para 404, 422).


Deliverable: UI con paginación y ordenamiento por categoría, commit con optimizaciones.

## Semana 10

## Realizado

Objetivo: Preparar autenticación básica y mejorar la experiencia del usuario.
Tareas:

Investigar y configurar autenticación (e.g., JWT con fastapi-users o una solución simple).
Implementar login para administrador (ruta /login con usuario/contraseña hardcoded o en base de datos).
Proteger endpoints CRUD (POST, PUT, DELETE) con autenticación (solo admin).
Añadir feedback visual al crear/eliminar productos (e.g., notificación de éxito).


Deliverable: Login funcional para admin, endpoints protegidos, commit con UI feedback.

## Semana 11 (Entregable 2 - MVP Funcional)

## Realizado

Objetivo: Entregar un MVP completo para la dueña.
Tareas:

Integrar todas las funcionalidades: CRUD, búsqueda, paginación, ordenamiento, autenticación.
Documentar instrucciones detalladas para la dueña (cómo usar login, agregar productos).
Preparar screenshots y video demo para el entregable.


Deliverable: Repositorio con MVP funcional, demo exitosa con la dueña, entrega antes de la fecha límite.

## Semana 12

Objetivo: Añadir filtros avanzados y mejorar seguridad.
Tareas:

Implementar filtros en la UI (e.g., dropdown para filtrar por categoria).
Añadir validación de roles (solo admin puede acceder a ciertas rutas).
Optimizar consultas a la base de datos (e.g., índices para categoria).
Refactorizar código backend para mayor modularidad.


Deliverable: Filtros por categoría, commit con mejoras de seguridad.

## Semana 13

Objetivo: Mejorar la experiencia del administrador.
Tareas:

Añadir edición de productos (formulario para PUT /products/{id}).
Implementar logout para el administrador.
Añadir historial de cambios (e.g., log básico de creaciones/eliminaciones).
Probar estabilidad con múltiples operaciones.


Deliverable: Edición de productos, logout, commit con historial básico.

## Semana 14

Objetivo: Preparar despliegue y escalabilidad.
Tareas:

Configurar despliegue local (e.g., Docker o un archivo requirements.txt completo).
Migrar a PostgreSQL (opcional, si SQLite es insuficiente).
Añadir documentación de despliegue (instrucciones para hosting).
Probar rendimiento con 100+ productos.


Deliverable: Configuración de despliegue, commit con migración a PostgreSQL (si aplica).

## Semana 15

Objetivo: Pulir UI y preparar presentación.
Tareas:

Añadir temas oscuros/claros (toggle en la UI).
Mejorar accesibilidad (e.g., etiquetas ARIA, contraste).
Grabar video final con todas las funcionalidades.
Revisar y actualizar README completo.


Deliverable: UI pulida, video final, commit con accesibilidad.

## Semana 16 (Final)

Objetivo: Entrega final y presentación.
Tareas:

Realizar presentación al docente Jack.
Subir repositorio final con todos los commits.
Recolectar feedback y documentar lecciones aprendidas.
Celebrar el éxito del proyecto!


Deliverable: Repositorio final, presentación exitosa, informe de lecciones aprendidas.

# Historias de Usuario

## Historia 1: Agregar Producto (Must - MVP)

Como dueño, quiero agregar un nuevo producto para mantener el catálogo actualizado.
Criterios de Aceptación:

Dado un formulario con nombre, precio y categoría, cuando ingreso datos válidos (ej., "Queso Campesino", 12000, "Lácteos"), entonces se crea el producto y aparece en la lista.
Dado un formulario con categoría vacía, cuando intento enviar, no dejará enviarlo por no completar el formulario.
Dado un nombre duplicado, cuando intento enviar, entonces recibo un error 409.



## Historia 2: Consultar Productos (Must - MVP)

Como dueño o cliente, quiero ver la lista de productos para conocer los precios disponibles.
Criterios de Aceptación:

Dado que la API devuelve productos, cuando cargo la página, entonces se muestra la lista con nombre, precio y categoría.
Dado que no hay productos, cuando cargo la página, entonces se muestra un mensaje "No hay productos".



## Historia 3: Buscar Productos (Should - MVP)

Como dueño y cliente, quiero buscar productos por nombre para encontrar algo específico rápidamente.
Criterios de Aceptación:

Dado un campo de búsqueda, cuando ingreso "Queso" con debounce de 300ms, entonces se filtra la lista con coincidencias.
Dado un término no encontrado, cuando busco, entonces se muestra "No se encontraron productos".



## Historia 4: Eliminar Producto (Should - MVP)

Como dueño, quiero eliminar un producto para quitar ítems obsoletos del catálogo.
Criterios de Aceptación:

Dado un producto en la lista, cuando hago clic en eliminar y confirmo, entonces se borra y desaparece de la UI.
Dado un ID inválido, cuando intento eliminar, entonces recibo un error 404.



## Historia 5: Ordenar Productos (Could - MVP)

Como dueño, quiero ordenar productos por precio o nombre para organizar el catálogo.
Criterios de Aceptación:

Dado un botón de ordenamiento, cuando selecciono "precio ascendente", entonces la lista se ordena de menor a mayor.



## Historia 6: Login Administrador (Won’t - PostMVP)

Como dueño, quiero iniciar sesión para proteger las acciones de administración.
Criterios de Aceptación:

Dado un formulario de login, cuando ingreso credenciales válidas, entonces accedo a CRUD.

# Base de Datos (SQLite + SQLAlchemy)

# Entidades implementadas:

| Entidad  | Campos Principales                         | Relaciones                 |
| -------- | ------------------------------------------ | -------------------------- |
| User     | id, username, email, hashed_password       | 1:N productos creados      |
| Category | id, name                                   | 1:N productos              |
| Supplier | id, name, phone, email                     | 1:N productos              |
| Product  | id, name, price, categoria_id, supplier_id | FK a categoría y proveedor |


# MER

``` sql 
Table users {
  id integer [pk]
  username varchar
  email varchar
  hashed_password varchar
}

Table categories {
  id integer [pk]
  name varchar
}

Table suppliers {
  id integer [pk]
  name varchar
  phone varchar
  email varchar
}

Table products {
  id integer [pk]
  name varchar
  price float
  categoria_id integer [ref: > categories.id]
  supplier_id integer [ref: > suppliers.id]
}
+-------------+
```
# Endpoints Principales

| Método | Ruta           | Descripción                                    |
| ------ | -------------- | ---------------------------------------------- |
| POST   | /register      | Crear nuevo usuario                            |
| POST   | /login         | Autenticación (retorna JWT)                    |
| GET    | /me            | Datos del usuario autenticado                  |
| GET    | /products      | Listar productos (paginación, búsqueda, orden) |
| POST   | /products      | Crear producto (requiere JWT)                  |
| PUT    | /products/{id} | Editar producto                                |
| DELETE | /products/{id} | Eliminar producto                              |
| GET    | /health        | Estado de la API (OK)                          |

# Ejemplo de Login

# Request:

```json
POST /login
{
  "username": "adminBurbano",
  "password": "Burba12"
}
```
# Rate Limiting

/login: Máximo 5 solicitudes/minuto por IP.

APIs autenticadas: Máximo 60 solicitudes/minuto por token/IP.

Si se excede:
HTTP 429 → {"detail": "Demasiadas solicitudes. Intenta más tarde."}

# Esquema Pydantic:

```python
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    categoria: str = Field(..., min_length=1, max_length=50)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: str | None = Field(None, min_length=1, max_length=100)
    price: float | None = Field(None, ge=0)
    categoria: str | None = Field(None, min_length=1, max_length=50)

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True
```


# Ejemplos JSON:

* POST /products (Request):
```json

{
  "name": "Queso Campesino",
  "price": 12000.0,
  "categoria": "Lácteos"
}
```
* POST /products (Response 201):

```json
{
  "id": 1,
  "name": "Queso Campesino",
  "price": 12000.0,
  "categoria": "Lácteos"
}
```
* GET /products (Response 200):
```json
[
  {
    "id": 1,
    "name": "Queso Campesino",
    "price": 12000.0,
    "categoria": "Lácteos"
  }
]
```
# Sección de Arquitectura (Diagrama, Librerías, Estado, Errores)
+----------------+         +----------------+
|    Frontend    |         |    Backend     |
| (React + Vite) | <-----> | (FastAPI)      |
| - App.jsx      |  CORS   | - main.py      |
| - api.js       |         | - products.py  |
+----------------+         +----------------+
VITE_API_URL: http://127.0.0.1:8000

# Manejo de errores

| Código | Descripción               | Ejemplo                                   |
| ------ | ------------------------- | ----------------------------------------- |
| 401    | Token inválido o expirado | {"detail": "Token inválido"}              |
| 404    | Recurso no encontrado     | {"detail": "Producto no encontrado"}      |
| 409    | Duplicado / conflicto     | {"detail": "Nombre ya existe"}            |
| 422    | Datos inválidos           | {"detail": "Datos faltantes o inválidos"} |


## Librerías Clave y Justificación:

Frontend: React + Vite (rápido desarrollo, UI reactiva), Tailwind CSS (estilos consistentes).
Backend: FastAPI (API rápida con validaciones), Pydantic (esquemas robustos), httpx (pruebas).
Razón: Simplicidad para MVP, sin dependencias pesadas.


## Estrategia de Estado en Frontend:

Uso de useState y useEffect para manejar productos, búsqueda, y estados (carga/error) localmente. No se usan librerías adicionales (e.g., Redux) para mantener el código ligero.
