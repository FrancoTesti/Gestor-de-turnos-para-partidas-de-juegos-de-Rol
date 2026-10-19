# Verificación del módulo de Modelo ORM/SQL, Clases, Tiendas y Personajes (Backend)

**Responsable:** Alejandro Mario Ciesco  
**Fecha de verificación:** 28 de septiembre de 2026  
**Alcance:** Esquema relacional (`SQL/rpg.sql`, `src/entities/`, `mikro-orm.config.ts`) y capas backend completas de Clases (`class.*`), Tiendas (`shop.*`) y Personajes (`character.*`).

## Requisitos comprobados

- [x] **Instalación limpia desde cero**: Clonado, instalación de dependencias con `npm ci` en raíz y `frontend/`, configuración de `.env`, creación de esquema (`npm run schema:create`) y validación de metadatos de entidades (`src/validate-entities.ts`).
- [x] **Compilación y análisis estático**: `npm run build` en backend y frontend sin errores de tipado; `npm run lint` en frontend con 0 errores y 0 advertencias.
- [x] **Suites de pruebas automatizadas**: Pruebas unitarias de `class.service.test.ts`, `class.controller.test.ts`, `shop.service.test.ts` y `character.service.test.ts` aprobadas.
- [x] **Contraste de API**: `docs/api.md` actualizado y validado contra el código real de `src/routes/`, `src/controllers/`, `src/services/` y `src/validators/` para los endpoints de `/clases`, `/tiendas` y `/personajes`.
- [x] **Checklist manual ejecutado y firmado**: Casillas de clases, tiendas y personajes con inicialización de Inventario #1 y filtros reactivos por clase firmadas en `docs/pruebas_manuales.md`.

## Matriz aplicada

| Operación | Permiso y Regla |
| --- | --- |
| Consultar catálogo de clases (`GET /clases`, `/clases/:id`) | Todo usuario autenticado (`ClaseService.getAll` / `getById`) |
| Administrar clases (`POST`, `PUT`, `DELETE /clases`) | Solo usuarios con perfil de anfitrión (`validarCrearClase`, `validarActualizarClase`) |
| Consultar tiendas (`GET /tiendas`, `/tiendas/:id`) | Todo usuario autenticado; permite filtrar por `idPartida` (`TiendaService.getAll`) |
| Administrar tiendas (`POST`, `PUT`, `DELETE /tiendas`) | Solo usuarios con perfil de anfitrión; verifica existencia de `Clase` y `Partida` asociadas (`ErrorValidacionTienda`) |
| Crear personaje (`POST /personajes`) | Solo usuarios con perfil de jugador activo; inicializa automáticamente con 100 monedas, 0 XP, nivel 1 e `Inventario` #1 (capacidad 10) en `PersonajeService.createCharacter` |
| Validaciones al crear personaje en partida | Rechazo si la partida está finalizada, si la contraseña privada no coincide, si el cupo (`limiteJugadores`) está lleno o si el jugador ya tiene un personaje en la partida |
| Editar personaje (`PUT /personajes/:id`) | Solo el jugador dueño; restringe edición a `nombreFicticio`, `raza` e `idClase` |
| Eliminar personaje (`DELETE /personajes/:id`) | Solo el jugador dueño; rechaza con `409` si posee objetos en `Inventario` o historial en `PersonajeSesion` |

## Evidencia automática

Los siguientes comandos se ejecutaron exitosamente:

- **Backend Build**: `npm run build` — compila sin errores.
- **Backend Tests**: `npm test` — pruebas unitarias de `class.service`, `class.controller`, `shop.service` y `character.service` aprobadas.
- **Frontend Build**: `npm run build` (en `frontend/`) — compila bundle de producción sin advertencias.
- **Frontend Lint**: `npm run lint` (en `frontend/`) — 0 errores, 0 advertencias analizados con oxlint.
- **Frontend Tests**: `npm test` (en `frontend/`) — 71 pruebas aprobadas.
- **Docs Link Checker**: `npm run docs:check` — archivos de documentación verificados sin enlaces rotos.

## Flujos verificados

1. **Catálogo de clases y tiendas**: Alta, edición, consulta y baja de clases (`ClaseService`) y tiendas (`TiendaService`) vinculadas opcionalmente a una clase y una partida.
2. **Creación y baja de personaje**: Asignación automática de `Inventario` #1 (capacidad 10) y estadísticas iniciales (`dinero: 100`, `xp: 0`, `nivel: 1`); verificación de bloqueo por cupo, un personaje por jugador por partida y protección de baja si posee historial u objetos.
3. **Filtros por clase**: Filtrado de personajes por clase en `PersonajeService.getAll({ idClase })` (`GET /api/personajes?idClase=X`).

