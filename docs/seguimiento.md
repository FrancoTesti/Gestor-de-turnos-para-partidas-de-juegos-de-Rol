# Seguimiento de funcionalidades y defectos

Registro vivo del cierre. Cada defecto que aparezca en la verificación manual, en un ensayo o en una
revisión se anota acá con quién lo encontró y el PR que lo resuelve. La matriz completa de
requisitos, con implementación y pruebas, está en [entrega.md](entrega.md); este archivo no la
repite.

Estados: **Abierto** (sin corrección), **En curso** (rama o PR abierto), **Resuelto** (fusionado en
`main`), **Justificado** (no se corrige y se explica por qué).

## Funcionalidades por módulo

| Módulo | Responsable | Implementado | Checklist manual ([pruebas_manuales.md](pruebas_manuales.md)) |
| --- | --- | --- | --- |
| **Backend — Modelo ORM/SQL, Catálogo Base y Personajes:** entidades (`src/entities/`), `SQL/rpg.sql`, `mikro-orm.config.ts` y capas completas (DTO, validador, controlador, servicio, ruta y tests) de **Clases**, **Tiendas** y **Personajes** | Alejandro Mario Ciesco | Sí | 3 casillas ejecutadas el 28/09 (P1 a P3) |
| **Backend — Servidor HTTP, Seguridad y Cuentas:** `app.ts`, autenticación (`auth.ts`, `password.ts` con `scrypt` y cookies `HttpOnly`), permisos (`authorization.ts`), módulos de **Usuarios**, **Jugadores** y **Anfitriones**, migración a Supabase y scripts | Emanuel Salomón | Sí | 9 casillas ejecutadas (C1 a C9) |
| **Backend — Motor Transaccional de Juego y Comercio:** módulos de **Partidas**, **Sesiones**, **Misiones**, **Karma**, **Inventarios** y **Objetos/Comercio** (`match.service.ts`, `game.service.ts`, `item.service.ts`), bloqueos pesimistas, integración en PostgreSQL y despliegue en Render | Franco Testi | Sí | 4 casillas ejecutadas el 18/09 |
| **Frontend — Arquitectura React, UI, Cuentas y Turnos:** `App.tsx`, `UserContext`, `ThemeContext`, `MainLayout`, `api.ts`, componentes `ui/`, pantallas de **Login/Registro/Perfiles/Usuarios**, flujo de **Partidas, Sesiones y Misiones**, accesibilidad WCAG 2 AA, E2E y CI/CD | Renzo Scollo | Sí | Verificado en suites E2E, accesibilidad y revisión responsive (24/09 y 08/10) |
| **Frontend — Interfaces de Dominio RPG, Comercio e Inventarios:** `interfaces.ts`, servicios cliente y pantallas/componentes de **Personajes**, **Clases**, **Tiendas**, **Objetos (Compra y Venta)**, **Gestor de Inventarios** (`ModulePage.tsx`) y tests unitarios de interfaz | Octavio Alejandro Gudiño | Sí | 7 casillas ejecutadas el 25/09 |

Actualizar la última columna cuando se incorporen nuevas verificaciones manuales en `pruebas_manuales.md`.

## Defectos

| # | Fecha | Encontró | Defecto | Estado | Resolución |
| --- | --- | --- | --- | --- | --- |
| 1 | 14/09 | Renzo Scollo | `main` quedó sin compilar el frontend y la calificación de sesiones fallaba después de un merge con la CI en rojo | Resuelto | [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34), commit `d94cf81` |
| 2 | 15/09 | Emanuel Salomón | Con el backend caído las pantallas mostraban el texto crudo `Error HTTP 502` | Resuelto | Commit `1f0ec13` (15/09), integrado en [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35) |
| 3 | 21/09 | Renzo Scollo | Desbordes a 375 px, contraste insuficiente y errores visibles solo en consola (detalle en [evidencia_calidad_visual.md](evidencia_calidad_visual.md)) | Resuelto | [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38), commits `025bf92` y `4fc9f5b` |
| 4 | 24/09 | Emanuel Salomón (Revisión de `api.md`) | `docs/api.md` difería del código en 12 puntos: códigos de estado de `POST /personajes` y de `/completar` con personajes repetidos (400), formato del 400 de `/usuarios`, `PUT /misiones` no parcial, condiciones de `/jugar`, `/finalizar` y `/calificar`, entre otros | Resuelto | Corregido en `docs/api.md` (commits del 24/09 integrados en [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) y ampliado en [#41](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/41), [#44](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/44) y [#46](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/46)) |
| 5 | 24/09 | Emanuel Salomón (Revisión de `api.md`) | Un cuerpo JSON de más de 64 KB respondía **500** «No se pudo completar la operación» en lugar de **413**: el manejador central de `src/app.ts` no reconocía el error de tamaño de `express.json` | Resuelto | `errorHandler` responde **413** «Los datos enviados superan el límite de 64 KB. Acortá el texto e intentá de nuevo.»; prueba en `src/tests/errors.test.ts` (commit `657a6f4`, integrado en [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40)) |
| 6 | 07/10 | Franco Testi y Emanuel Salomón | En PostgreSQL, `SELECT ... FOR UPDATE` sobre el lado opcional de un `LEFT JOIN` fallaba con **500** en las operaciones transaccionales de compra, venta y movimiento de objetos | Resuelto | [#54](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/54), carga de relaciones con `strategy: 'select-in'` en `src/services/item.service.ts` y `src/services/game.service.ts` ([evidencia_concurrencia.md](evidencia_concurrencia.md)) |
| 7 | 07/10 | Renzo Scollo y Octavio Gudiño | Regresión en el CI del frontend por orden de hooks en `UserDetail` y desborde responsivo a 375 px tras cambios visuales | Resuelto | Revertido preventivamente en [#52](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/52) y [#55](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/55); corregido y reintegrado con CI en verde en [#58](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/58) |
| 8 | 14/10 | Franco Testi (Backend) y Octavio Gudiño (Frontend) | Los objetos no únicos se agotaban tras una compra, reaparecían duplicados en la tienda al venderse y permitían comprar sin validar el nivel requerido del personaje | Resuelto | [#72](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/72), [#73](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/73) y [#76](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/76): clonación de instancias para objetos comunes en `item.service.ts` y validación estricta de nivel en frontend (`ShopsPage`/`ItemsPage`) y backend (HTTP 400) |


## Cómo agregar un defecto

1. Una fila nueva con el número siguiente, la fecha, quién lo encontró y qué se ve (qué se hizo y
   qué pasó, no la causa supuesta).
2. Estado **Abierto** hasta que haya una rama. Al abrir el PR, pasar a **En curso** y enlazarlo.
3. Al fusionar, **Resuelto** con el enlace al PR. Si se decide no corregirlo, **Justificado** con
   el motivo.
