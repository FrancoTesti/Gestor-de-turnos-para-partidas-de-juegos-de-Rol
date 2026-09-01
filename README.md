# TP Gestor de Turnos para Partidas de Juegos de Rol

**Integrantes:**
- Franco Testi
- Octavio Gudiño
- Renzo Scollo
- **Alejandro Ciesco**
- Emanuel Salomón

---

## 📌 Rama Actual: `feature/clases-personajes`

Esta rama contiene la implementación completa y pulida de las responsabilidades asignadas a **Alejandro Ciesco**: el **CRUD completo de Clase** y el caso de uso **Crear Personaje**.

---

## 🚀 Cambios Específicos Realizados por Alejandro Ciesco

### 1. Backend (`src/`)

#### Entidades y Rutas Principales
- **[`src/entities/Personaje.entity.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/entities/Personaje.entity.ts)**:
  - Se configuró la clave primaria como `@PrimaryKey({ type: 'number', autoincrement: true })` y `[OptionalProps]?: 'idPersonaje'` para soportar la creación con autoincremento en MySQL.
- **[`src/app.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/app.ts)**:
  - Se registraron los routers de la API para `/api/clases`, `/api/personajes`, `/api/jugadores` y `/api/partidas`.

#### DTOs y Validadores
- **[`src/types/personaje.dto.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/types/personaje.dto.ts)**:
  - Definición de interfaces `CrearPersonajeDTO`, `ActualizarPersonajeDTO` y `PersonajePublicoDTO`.
- **[`src/validators/personaje.validator.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/validators/personaje.validator.ts)**:
  - Validaciones estrictas de datos de entrada (`validarCreacionPersonaje` y `validarActualizacionPersonaje`).

#### Lógica de Negocio y Controladores
- **[`src/services/personaje.service.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/services/personaje.service.ts)**:
  - Métodos `obtenerTodos` (con filtro opcional por `idClase`), `obtenerPorId`, `crearPersonaje`, `actualizarPersonaje` y `eliminarPersonaje`.
  - **Validación de Referencias**: Comprueba que la `Clase`, el `Jugador` y la `Partida` existan en la BD antes de crear/actualizar un personaje.
  - **Valores Iniciales Coherentes**: Asigna automáticamente `nivel: 1`, `xp: 0` y `dinero: 100` si no son provistos.
- **[`src/controllers/personaje.controller.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/controllers/personaje.controller.ts)** y **[`src/routes/personaje.routes.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/src/routes/personaje.routes.ts)**:
  - Endpoints REST para `/api/personajes` con respuestas de error estandarizadas (`400`, `404`, `500`).
- **Servicios/Rutas de Apoyo**:
  - `src/services/jugador.service.ts` y `src/routes/jugador.routes.ts` (`/api/jugadores`).
  - `src/services/partida.service.ts` y `src/routes/partida.routes.ts` (`/api/partidas`).

---

### 2. Frontend (`frontend/src/`)

#### Módulo de Clase (CRUD Completo)
- **[`ClaseLista.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/clases/ClaseLista.tsx)**: Vista de tarjetas de clases con estados de carga, lista vacía, edición y eliminación.
- **[`ClaseFormulario.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/clases/ClaseFormulario.tsx)**: Formulario interactivo para altas y ediciones de clase.
- **[`ClaseDetalle.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/clases/ClaseDetalle.tsx)**: Ficha de detalle de una clase.
- **[`clases.css`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/clases/clases.css)**: Estilos CSS del módulo.

#### Módulo de Personaje (Caso de Uso "Crear Personaje")
- **[`PersonajeFormulario.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/personajes/PersonajeFormulario.tsx)**: Formulario del caso de uso **Crear personaje**, que carga dinámicamente y permite seleccionar **Jugador**, **Clase** y **Partida**, especificando datos generales y valores iniciales.
- **[`PersonajeLista.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/personajes/PersonajeLista.tsx)**: Listado con **filtro desplegable por Clase**, que exhibe nombre del personaje, jugador asociado, XP, nivel, raza e ID.
- **[`PersonajeDetalle.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/personajes/PersonajeDetalle.tsx)**: Ficha detallada del personaje.
- **[`personajes.css`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/components/personajes/personajes.css)** y cliente API **[`personaje.service.ts`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/services/personaje.service.ts)**.

#### Integración Transversal
- **[`src/App.tsx`](file:///c:/Users/Alejandro/Desktop/Carpetas/Programacion/Antigravity/Gestor-de-turnos-para-partidas-de-juegos-de-Rol-main/frontend/src/App.tsx)**: Pestañas de navegación para alternar limpiamente entre los módulos desarrollados.

---

## 🛠️ Instrucciones de Ejecución

### Backend
```bash
# En el directorio raíz
npm install
npm run build
npm run dev
```

### Frontend
```bash
# En el directorio /frontend
cd frontend
npm install
npm run build
npm run dev
```
