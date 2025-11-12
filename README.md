# Salsamentaría Burbano — Digital Price List

## Descripción del Proyecto

Aplicación web full-stack para la gestión digital de precios en pequeños negocios. Permite al propietario administrar productos, categorías y proveedores desde cualquier dispositivo, eliminando la necesidad de imprimir listas de precios constantemente.

**Características principales:**
- Sistema de autenticación con JWT
- CRUD completo de productos, categorías y proveedores
- Lista pública de precios actualizada en tiempo real
- Rate limiting para seguridad
- Interfaz responsive con tema claro/oscuro
- Base de datos SQLite con SQLAlchemy

## Elevator Pitch

En una salsamentaria tradicional, el propietario debe imprimir listas de precios constantemente para mantenerlas actualizadas, lo que genera desperdicio de papel, tiempo y errores manuales. Esta aplicación web permite al propietario gestionar precios de productos en tiempo real, desde PC o celular, con un login seguro y una interfaz moderna.

Dirigida a pequeños negocios como salsamentarias, reduce costos y mejora la eficiencia operativa, permitiendo actualizar precios fácilmente y que los clientes consulten la lista actualizada.

## Usuarios

### Usuario Principal (Propietario/Administrador)
* Crear, editar y eliminar productos
* Iniciar sesión (login protegido con JWT)
* Gestionar categorías y proveedores

### Usuario Secundario (Cliente)
* Consultar la lista pública de precios
* Buscar y filtrar productos sin autenticación

## Objetivos y No-Objetivos

### Objetivos
* Implementar un MVP funcional con CRUD completo de productos, categorías y proveedores
* Añadir autenticación JWT, protección de rutas y rate limiting
* Integrar SQLite como base de datos persistente
* Proporcionar una interfaz clara y responsive

### No-Objetivos (explícitamente no se hizo en MVP)
* No se implementan roles múltiples ni multiusuario avanzado
* No se incluyen reportes PDF o notificaciones
* No se implementa despliegue en la nube (solo entorno local)

## Métricas/KPIs de Éxito

* CRUD y autenticación responden en menos de 500ms
* UI carga productos en menos de 2 segundos
* Flujo completo: login → CRUD → logout funcional
* Manejo de errores controlado (401, 404, 409, 422, 429)
* Éxito: El dueño actualiza precios en menos de 1 minuto sin errores

## Historias de Usuario

### Historia 1: Agregar Producto (Must - MVP)
**Como** dueño, **quiero** agregar un nuevo producto **para** mantener el catálogo actualizado.

**Criterios de Aceptación:**
- Dado un formulario con nombre, precio, categoría y proveedor, cuando ingreso datos válidos (ej., "Queso Campesino", 12000, "Lácteos", "Burbano Family"), entonces se crea el producto y aparece en la lista.
- Dado un formulario con campos vacíos, cuando intento enviar, no dejará enviarlo por no completar el formulario.
- Dado un nombre duplicado, cuando intento enviar, entonces recibo un error 409.

### Historia 2: Consultar Productos (Must - MVP)
**Como** dueño o cliente, **quiero** ver la lista de productos **para** conocer los precios disponibles.

**Criterios de Aceptación:**
- Dado que la API devuelve productos, cuando cargo la página, entonces se muestra la lista con nombre, precio, categoría y proveedor.
- Dado que no hay productos, cuando cargo la página, entonces se muestra un mensaje "No hay productos".

### Historia 3: Buscar Productos (Should - MVP)
**Como** dueño y cliente, **quiero** buscar productos por nombre **para** encontrar algo específico rápidamente.

**Criterios de Aceptación:**
- Dado un campo de búsqueda, cuando ingreso "Queso" con debounce de 400ms, entonces se filtra la lista con coincidencias.
- Dado un término no encontrado, cuando busco, entonces se muestra "No se encontraron productos".

### Historia 4: Eliminar Producto (Should - MVP)
**Como** dueño, **quiero** eliminar un producto **para** quitar ítems obsoletos del catálogo.

**Criterios de Aceptación:**
- Dado un producto en la lista, cuando hago clic en eliminar y confirmo, entonces se borra y desaparece de la UI.
- Dado un ID inválido, cuando intento eliminar, entonces recibo un error 404.

### Historia 5: Ordenar Productos (Could - MVP)
**Como** dueño, **quiero** ordenar productos por precio, nombre o categoría **para** organizar el catálogo.

**Criterios de Aceptación:**
- Dado un control de ordenamiento, cuando selecciono "precio ascendente", entonces la lista se ordena de menor a mayor.

### Historia 6: Login Administrador (Must - MVP)
**Como** dueño, **quiero** iniciar sesión **para** proteger las acciones de administración.

**Criterios de Aceptación:**
- Dado un formulario de login, cuando ingreso credenciales válidas, entonces accedo al panel de administración.

## Roadmap

### Semana 6 (Completada - Entregable 1) ✅
- Vertical slice con entidad Producto (CRUD completo: POST, GET, PUT, DELETE)
- Búsqueda con debounce (400ms) en la UI
- Estados de carga y error en el frontend
- Prueba backend mínima pasando (crear producto)
- Documentación inicial (README, ERD, API design)

### Semana 7 ✅
- Mejorar estilos en App.css (responsividad, consistencia visual)
- Añadir validaciones frontend (mostrar errores antes de enviar)
- Configurar SQLite como base de datos
- Crear migraciones iniciales para la tabla Producto

### Semana 8 ✅
- Implementar conexión a SQLite en el backend (SQLAlchemy)
- Migrar lógica de CRUD a usar la base de datos
- Añadir pruebas backend para GET, PUT, y DELETE
- Actualizar documentación (ERD con base de datos)

### Semana 9 ✅
- Implementar paginación en la UI (offset y limit)
- Añadir ordenamiento por categoría en el backend
- Optimizar búsqueda
- Refinar manejo de errores (404, 422, 409)

### Semana 10 ✅
- Configurar autenticación JWT
- Implementar login para administrador
- Proteger endpoints CRUD (POST, PUT, DELETE) con autenticación
- Añadir feedback visual al crear/eliminar productos

### Semana 11 (Entregable 2 - MVP Funcional) ✅
- Integrar todas las funcionalidades: CRUD, búsqueda, paginación, ordenamiento, autenticación
- Añadir gestión de Categorías y Proveedores
- Implementar validaciones de integridad referencial
- Implementar rate limiting
- Crear lista pública de productos
- Preparar demo y documentación final

## Tecnologías Utilizadas

**Backend:**
- FastAPI 0.115.0
- SQLAlchemy (ORM)
- Python-jose (JWT)
- Passlib (bcrypt para contraseñas)
- Pydantic (validaciones)

**Frontend:**
- React 19.1.1
- React Router DOM 7.9.4
- Vite 7.1.2
- CSS moderno con variables

**Base de Datos:**
- SQLite (desarrollo local)

## Estructura del Proyecto
```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── products.py
│   │   │       ├── categories.py
│   │   │       └── suppliers.py
│   │   ├── auth/
│   │   │   ├── auth.py
│   │   │   ├── dependencies.py
│   │   │   └── register.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── models/
│   │   │   ├── product.py
│   │   │   ├── category.py
│   │   │   └── supplier.py
│   │   ├── db.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_api.py
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── PublicList.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── utils/
│   │   │   └── auth.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

## Instalación y Ejecución

### Requisitos Previos

- Python 3.10+
- Node.js 18+
- uv (gestor de paquetes Python): https://github.com/astral-sh/uv

### Backend (FastAPI)
```bash
# 1. Navegar a la carpeta backend
cd backend

# 2. Crear y activar entorno virtual
uv venv .venv

# En macOS/Linux:
source .venv/bin/activate

# En Windows:
.venv\Scripts\Activate.ps1

# 3. Instalar dependencias
uv pip install -r requirements.txt

# 4. Crear archivo .env en la raíz del proyecto
# (copiar desde .env.example y ajustar valores)

# 5. Ejecutar servidor
uv run uvicorn app.main:app --reload --port 8000

# Backend disponible en: http://127.0.0.1:8000
# Documentación API: http://127.0.0.1:8000/docs
```

### Frontend (React + Vite)
```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env.development con:
echo "VITE_API_URL=http://127.0.0.1:8000" > .env.development

# 4. Ejecutar servidor de desarrollo
npm run dev

# Frontend disponible en: http://localhost:5173
```

### Ejecutar Tests
```bash
cd backend
source .venv/bin/activate 
uv run pytest -v
```

## Variables de Entorno

**Backend (.env en raíz del proyecto):**
```env
# Seguridad
SECRET_KEY=tu_clave_secreta_super_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Rate Limiting
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_SECONDS=60

# Registro
INVITE_CODE=BUrBAN02o25

# Base de Datos
DATABASE_URL=sqlite:///./products.db

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Frontend (.env.development en frontend/):**
```env
VITE_API_URL=http://127.0.0.1:8000
```

## Endpoints Principales

### Autenticación (Públicos)

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| POST | `/login` | Autenticación con JWT | `username`, `password` (form) |
| POST | `/register` | Crear nuevo usuario | `username`, `email`, `password`, `invite_code` |
| GET | `/login/me` | Datos del usuario autenticado | Header: `Authorization: Bearer <token>` |

### Productos

| Método | Ruta | Público | Descripción |
|--------|------|---------|-------------|
| GET | `/products` | ✅ | Listar productos (búsqueda, paginación, orden) |
| GET | `/products/{id}` | ✅ | Obtener producto por ID |
| POST | `/products` | ❌ | Crear nuevo producto |
| PUT | `/products/{id}` | ❌ | Actualizar producto |
| DELETE | `/products/{id}` | ❌ | Eliminar producto |

**Parámetros de búsqueda (GET /products):**
- `q`: búsqueda por nombre
- `sort`: ordenar por `name`, `price`, o `categoria`
- `order`: `asc` o `desc`
- `offset`: paginación (inicio)
- `limit`: cantidad de resultados (1-100)

### Categorías

| Método | Ruta | Público | Descripción |
|--------|------|---------|-------------|
| GET | `/categories` | ✅ | Listar categorías |
| GET | `/categories/{id}` | ✅ | Obtener categoría por ID |
| POST | `/categories` | ❌ | Crear categoría |
| PUT | `/categories/{id}` | ❌ | Actualizar categoría |
| DELETE | `/categories/{id}` | ❌ | Eliminar categoría |

### Proveedores

| Método | Ruta | Público | Descripción |
|--------|------|---------|-------------|
| GET | `/suppliers` | ✅ | Listar proveedores |
| GET | `/suppliers/{id}` | ✅ | Obtener proveedor por ID |
| POST | `/suppliers` | ❌ | Crear proveedor |
| PUT | `/suppliers/{id}` | ❌ | Actualizar proveedor |
| DELETE | `/suppliers/{id}` | ❌ | Eliminar proveedor |

**Nota:** Los endpoints privados (❌) requieren header `Authorization: Bearer <token>`

## Modelo de Datos

### Entidades y Relaciones
```
User (1) ────── (N) [creador de productos]
                       
Category (1) ── (N) Product (N) ── (1) Supplier
```

**User:**
- id (int, PK)
- username (str, unique)
- email (str, unique)
- hashed_password (str)

**Category:**
- id (int, PK)
- name (str, unique)

**Supplier:**
- id (int, PK)
- name (str, unique)
- phone (str, nullable)
- email (str, nullable)

**Product:**
- id (int, PK)
- name (str, unique)
- price (float)
- categoria_id (int, FK → categories.id)
- supplier_id (int, FK → suppliers.id)

## Características de Seguridad

1. **JWT Authentication:** Tokens con expiración de 60 minutos
2. **Rate Limiting:** 
   - Login: máximo 5 intentos por minuto por IP
   - Registro: máximo 5 intentos por minuto por IP
3. **Código de Invitación:** Registro controlado (código: `BUrBAN02o25`)
4. **Password Hashing:** Bcrypt para almacenamiento seguro
5. **CORS:** Configurado para localhost en desarrollo
6. **Validaciones:** Pydantic para validación de datos en backend

## Validaciones Implementadas

- **Productos:**
  - Nombres únicos (insensible a mayúsculas)
  - Detección de nombres similares (normalización)
  - Precio mayor o igual a 0
  - Categoría y proveedor obligatorios

- **Categorías:**
  - Nombres únicos
  - No se puede eliminar si tiene productos asociados

- **Proveedores:**
  - Nombres únicos
  - No se puede eliminar si tiene productos asociados
  - Email opcional con formato válido

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Eliminación exitosa
- `400 Bad Request`: Error de validación o integridad
- `401 Unauthorized`: Token inválido o faltante
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Duplicado (nombre ya existe)
- `422 Unprocessable Entity`: Datos inválidos
- `429 Too Many Requests`: Rate limit excedido

## Uso de la Aplicación

### Para el Propietario (Admin)

1. Acceder a `/admin`
2. Iniciar sesión o crear cuenta con código de invitación
3. Gestionar categorías y proveedores en la sección "Gestión de Catálogo"
4. Crear productos con nombre, precio, categoría y proveedor
5. Buscar, ordenar y paginar productos
6. Editar o eliminar productos existentes

### Para los Clientes (Público)

1. Acceder a `/` (lista pública)
2. Buscar productos por nombre
3. Filtrar por categoría
4. Ordenar por nombre, precio o categoría
5. Ver información actualizada en tiempo real

## Desarrolladores

- Juan David Burbano y Cristian Fabián Muñoz
- Universidad: Universidad Autonoma de Occidente
- Curso: Estructura de datos y algoritmos 2
- Semestre: 2025-3

## Licencia

Proyecto académico - Uso educativo
