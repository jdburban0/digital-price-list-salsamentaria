# Elevator Pitch

En una salsamentaria tradicional, el propietario debe imprimir listas de precios constantemente para actualizarlos, lo que genera desperdicio de papel, tiempo y errores manuales. Esta solución es una aplicación web simple (accesible desde PC o móvil) que permite al propietario gestionar y actualizar precios de productos en tiempo real, con una vista pública para clientes. Dirigida a dueños de pequeños negocios como salsamentarias, reduce costos y mejora la eficiencia operativa.
Usuarios/Segmentos y Principales Casos de Uso

# Usuario Principal (Propietario/Administrador): 
Dueño de la salsamentaria (ej. la tía del usuario). Casos de uso: Crear/actualizar/eliminar productos con precios, buscar productos, ordenar lista por nombre o precio.

# Usuario Secundario (Cliente): 
Visitantes que ven la lista de precios pública (sin edición). Caso de uso: Ver precios actualizados en una página simple.
Principales casos: Gestión CRUD de productos/precios por admin, visualización pública.

# Objetivos y No-Objetivos

# Objetivos:

Proporcionar una interfaz simple para gestionar precios.
Integrar frontend React con backend FastAPI para CRUD básico.
Validar integración temprana con un vertical slice funcional.


# No-Objetivos (explícitamente no se hará en MVP):

Autenticación de usuarios (asumimos acceso libre para MVP; post-MVP con login simple).
Integración con bases de datos persistentes (usamos memoria temporal para MVP).
Funcionalidades avanzadas como exportar PDF o notificaciones.
Soporte multi-idioma o temas personalizados.



# Métricas/KPIs de Successo

La API responde en <500ms para operaciones CRUD.
UI carga lista de productos en <2s y maneja errores visiblemente.
Al menos 80% cobertura en pruebas backend para la entidad principal.
Feedback cualitativo: El propietario puede actualizar un precio en <1 min sin errores.
Éxito si el vertical slice permite crear/listar productos end-to-end.

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

Semana 6–11 (MVP): Vertical slice con CRUD de productos, UI básica, pruebas.
Semana 11–16 (Final): Agregar autenticación simple, paginación avanzada, vista pública para clientes, más pruebas, deployment básico (ej. Vercel/Heroku).