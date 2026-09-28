# Verificación del módulo de Alejandro Mario Ciesco

Fecha de verificación: 28 de septiembre de 2026.

Módulo: **Clases, personajes, filtros y acceso a partidas públicas y privadas**.

## Requisitos comprobados

- [x] **Instalación limpia desde cero**: Clonado, instalación de dependencias con `npm ci` en raíz y `frontend/`, configuración de `.env`, creación de esquema (`npm run schema:create`) y carga de datos iniciales (`npm run demo:datos`).
- [x] **Compilación y análisis estático**: `npm run build` en backend y frontend sin errores de tipado; `npm run lint` en frontend con 0 errores y 0 advertencias.
- [x] **Suites de pruebas automatizadas**: 104 pruebas unitarias de backend aprobadas y 71 pruebas de frontend aprobadas.
- [x] **Contraste de API**: `docs/api.md` actualizado y validado contra el código real de `src/routes/`, `src/controllers/`, `src/services/`, `src/validators/` y `src/security/authorization.ts` para los endpoints de `/clases`, `/partidas` y `/personajes`.
- [x] **Checklist manual ejecutado y firmado**: Casillas de partidas públicas/privadas, personajes con inicialización e inventario, y filtros reactivos por clase firmadas en `docs/pruebas_manuales.md`.

## Matriz aplicada

| Operación | Permiso y Regla |
| --- | --- |
| Consultar catálogo de clases (`GET /clases`, `/clases/:id`) | Todo usuario autenticado |
| Administrar clases (`POST`, `PUT`, `DELETE /clases`) | Solo usuarios con perfil de anfitrión |
| Consultar partidas activas (`GET /partidas/activas`) | Todo usuario autenticado; muestra solo partidas con `estado: true` |
| Crear y administrar partidas (`POST`, `PUT`, `DELETE /partidas`) | Solo el anfitrión creador; valida obligatoriedad de contraseña en privadas y rechazo en públicas |
| Crear personaje (`POST /personajes`) | Solo usuarios con perfil de jugador; inicializa automáticamente con 100 monedas, 0 XP, nivel 1 e inventario #1 (capacidad 10) en una transacción |
| Validaciones al unirse a partida | Rechazo si la partida está finalizada (`409`), si la contraseña privada no coincide (`409`), si el cupo está lleno (`409`) o si el jugador ya tiene un personaje en la partida (`409`) |
| Editar personaje (`PUT /personajes/:id`) | Solo el jugador dueño; restringe edición a nombre, raza y clase (`403` si se intenta alterar progresión) |
| Eliminar personaje (`DELETE /personajes/:id`) | Solo el jugador dueño; rechaza con `409` si posee objetos en inventario o historial de sesiones de juego |

## Evidencia automática

Los siguientes comandos se ejecutaron exitosamente:

- **Backend Build**: `npm run build` — compila sin errores.
- **Backend Tests**: `npm test` — 104 pruebas unitarias aprobadas en 14 archivos.
- **Frontend Build**: `npm run build` (en `frontend/`) — compila bundle de producción sin advertencias.
- **Frontend Lint**: `npm run lint` (en `frontend/`) — 0 errores, 0 advertencias en 73 archivos analizados con oxlint.
- **Frontend Tests**: `npm test` (en `frontend/`) — 71 pruebas aprobadas en 19 archivos.
- **Docs Link Checker**: `npm run docs:check` — 24 archivos de documentación verificados sin enlaces rotos.

## Flujos verificados

1. **Gestión de partidas**: Creación de partida pública y privada con validación de clave; actualización de propiedades y alternancia de privacidad.
2. **Creación de personaje**: Asignación atómica de inventario 1 (capacidad 10) y saldo inicial (100 monedas, 0 XP, nivel 1); verificación de bloqueo por cupo y de un personaje por jugador por partida.
3. **Filtros reactivos**: Filtrado de personajes por clase en UI y API (`GET /api/personajes?idClase=X`), y listado de partidas activas con información del anfitrión y disponibilidad de cupos.
