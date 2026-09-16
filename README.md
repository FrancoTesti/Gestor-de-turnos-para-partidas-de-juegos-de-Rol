# Gestor de turnos para partidas de juegos de rol

Trabajo práctico de Desarrollo de Software: Node.js, Express, TypeScript, MikroORM, MySQL y React.

Integrantes: Franco Testi, Octavio Gudiño, Renzo Scollo, Alejandro Ciesco y Emanuel Salomón.

**Toda la documentación está indexada en [docs/README.md](docs/README.md).**

## Empezar

El backend está en la raíz; el frontend, en `frontend/`. Son dos proyectos npm distintos: hay que
instalar dependencias en los dos.

1. Seguir [Instalación y actualización](docs/instalacion.md), incluida la configuración de MySQL y el `.env`.
2. Iniciar el backend con `npm run dev` y, en otra terminal dentro de `frontend`, ejecutar `npm run dev`.
3. Abrir `http://localhost:5173`, registrar una cuenta y entrar.

Las cuentas se guardan en MySQL. Si ya tenían usuarios con contraseñas sin hash, deben ejecutar la
migración explicada en la guía antes de iniciar sesión.

## Comandos

### Backend (raíz del repositorio)

| Comando | Qué hace |
| --- | --- |
| `npm ci` | Instala las dependencias exactas del `package-lock.json` |
| `npm run dev` | Levanta la API con recarga automática (nodemon + ts-node) en `http://localhost:3000` |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la API ya compilada (`dist/app.js`) |
| `npm test` | Pruebas unitarias con Vitest (`src/tests`). **No necesitan MySQL** |
| `npm run test:integration` | Pruebas contra MySQL real; crean y borran una base descartable |
| `npm run test:e2e` | Recorridos de navegador con Playwright (levanta API y Vite propios) |
| `npm run schema:create` | Crea las tablas en la base configurada a partir de las entidades |
| `npm run schema:dump` | Muestra el SQL que generarían las entidades, sin conectarse |
| `npm run passwords:migrate` | Convierte a hash las contraseñas antiguas guardadas en texto plano |

### Frontend (`cd frontend`)

| Comando | Qué hace |
| --- | --- |
| `npm ci` | Instala las dependencias del frontend |
| `npm run dev` | Servidor de desarrollo de Vite en `http://localhost:5173`, con proxy de `/api` al backend |
| `npm run build` | Chequea tipos y genera el build de producción en `frontend/dist/` |
| `npm run preview` | Sirve el build generado para revisarlo |
| `npm run lint` | Análisis estático con oxlint |
| `npm test` | Pruebas de componentes y páginas con Vitest + Testing Library |
| `npm run test:watch` | Las mismas pruebas en modo interactivo |

### Verificación antes de fusionar

```bash
npm ci
npm run build
npm test
cd frontend
npm ci
npm run build
npm run lint
npm test
```

Las pruebas de MySQL y los E2E se ejecutan aparte y solo contra una base temporal con nombre
aleatorio, nunca contra `DB_NAME`. Su configuración está en la [guía de instalación](docs/instalacion.md).

## Funciones

- Usuarios y perfiles de jugador/anfitrión, con sesión y permisos comprobados en el servidor.
- Clases, tiendas, partidas, personajes, objetos, inventarios, sesiones y misiones.
- Listado de partidas activas, personajes por clase y objetos sugeridos por clase.
- Compra, venta (70–100 % del valor), movimientos de inventario y recompensas transaccionales.
- Participación en sesiones y calificación del anfitrión una vez por jugador y sesión.

Detalle de reglas en [funcionalidad.md](docs/funcionalidad.md), endpoints en [api.md](docs/api.md)
y modelo de datos en [modelo.md](docs/modelo.md).

## Módulos por integrante

- **Renzo Scollo** — cliente HTTP único del frontend, manejo de errores y expiración de sesión,
  pruebas E2E con Playwright e integración continua en GitHub Actions.
- **Franco Testi** — partidas, sesiones, misiones, reparto de recompensas y calificación del anfitrión.
- **Alejandro Mario Ciesco** — clases, personajes, acceso a partidas públicas y privadas, filtros y
  creación transaccional del inventario inicial.
- **Octavio Alejandro Gudiño** — tiendas, objetos (incluido `esUnico`), compra con bloqueo pesimista,
  venta entre el 70 % y el 100 % del valor, y gestión de inventarios.
- **Emanuel Salomón** — cuentas y perfiles (registro, login, sesión, edición de datos propios) y
  documentación de entrega.

---

## Cambios implementados — Rama Alejandro Mario Ciesco (`feat/ciesco-clases-personajes-partidas`)

Esta rama implementa y valida de punta a punta las responsabilidades de **Alejandro Mario Ciesco**:

### 1. Clases de Personaje (`frontend/src/pages/ClasesPage.tsx`, `ClaseLista.tsx`, `ClaseFormulario.tsx`, `ClaseDetalle.tsx`)
- **Visualización y búsqueda**: Catálogo completo de clases con filtro interactivo por nombre y descripción, estado de carga (`Cargando...`), lista vacía y manejo de errores con reintento.
- **Control de acceso**: Solo los usuarios con rol de anfitrión pueden crear, editar o eliminar clases. Los jugadores pueden consultar el catálogo y ver el detalle de cada clase.
- **Integridad referencial**: Mensajes de error claros al intentar eliminar clases asociadas a tiendas o personajes.

### 2. Personajes y Acceso a Partidas (`frontend/src/pages/PersonajesPage.tsx`, `PersonajeLista.tsx`, `PersonajeDetalle.tsx`)
- **Acceso a partidas públicas y privadas**:
  - Selector de partidas activas con indicador de privacidad (🌐 Pública / 🔒 Privada) y cálculo dinámico de cupos disponibles (`X/Y disponibles`).
  - Solicitud de contraseña de partida exclusivamente cuando la partida es privada.
  - Bloqueo visual e informativo cuando una partida ya tiene su cupo completo.
- **CRUD y creación transaccional**:
  - Creación de personaje vinculada de forma segura al jugador autenticado (no permite crear a nombre de otros jugadores).
  - Creación automática del inventario inicial (`numInventario = 1`, `cantidadEspacio = 10`) en la misma transacción del backend.
  - Edición restringida a campos permitidos (`nombreFicticio`, `raza`, `idClase`), protegiendo nivel, experiencia, dinero y pertenencia.
  - Eliminación con validación de reglas de negocio: rechazo informado si el personaje posee historial de sesiones o si tiene objetos en inventario sin vender.
- **Filtro por clase**: Selector de filtro por clase con botón para limpiar el filtro fácilmente.

### 3. Pruebas Automatizadas
- **Backend (`src/tests/`)**:
  - `clase.service.test.ts`: Pruebas unitarias de CRUD completo para `ClaseService`.
  - `personaje.service.test.ts`: Pruebas unitarias de creación transaccional, validación de partidas privadas (contraseña), cupos máximos, jugador inactivo, jugador duplicado en la misma partida y restricciones de eliminación.
- **Frontend (`frontend/src/pages/__tests__/`)**:
  - `ClasesPage.test.tsx`: Pruebas de renderizado, búsqueda en tiempo real, creación y visualización de detalle.
  - `PersonajesPage.test.tsx`: Pruebas de listado, filtro por clase, solicitud condicional de contraseña en partidas privadas y feedback de creación.

