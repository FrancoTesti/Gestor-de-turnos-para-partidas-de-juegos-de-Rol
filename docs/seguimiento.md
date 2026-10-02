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
| Cuentas y perfiles | Emanuel Salomón | Sí | 9 casillas marcadas; falta la fecha de ejecución en cada una |
| Clases, personajes y acceso a partidas | Alejandro Mario Ciesco | Sí | 3 casillas ejecutadas el 28/09 |
| Objetos, tiendas, inventarios, compra y venta | Octavio Alejandro Gudiño | Sí | 7 casillas ejecutadas el 25/09 |
| Partidas, sesiones, misiones y calificación | Franco Testi | Sí | 4 casillas ejecutadas el 18/09 |
| Transversal: responsive, accesibilidad, E2E, CI | Renzo Scollo | Sí | Pendiente |

Actualizar la última columna cuando cada uno marque sus casillas en `pruebas_manuales.md`. Las dos
últimas casillas (acceso ajeno por HTTP y revisión de escritorio/móvil, tema y teclado) no tienen
responsable todavía.

## Funcionalidades y PR que las incorporaron

Entregas fusionadas desde el 14/09, de la más nueva a la más vieja. Las tandas anteriores (PR #1 al
#33) y los PR #25 a #34 están descriptos en la tabla de [entrega.md](entrega.md#enlaces-a-los-pr-del-grupo).

| PR | Fecha | Autor | Funcionalidad o cambio | Estado |
| --- | --- | --- | --- | --- |
| [#48](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/48) | 29/09 | Renzo Scollo | Pruebas de los caminos de error de `ClaseController` y `JugadorController` | Resuelto |
| [#47](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/47) | 29/09 | Renzo Scollo | Se deja de versionar `.env`, vuelve `.env.example` y el menú ya no desborda a 768 px | Resuelto |
| [#46](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/46) | 29/09 | Alejandro Ciesco | Verificación de la instalación, contraste de `api.md` y checklist de clases y personajes | Resuelto |
| [#45](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/45) | 26/09 | Franco Testi | Emojis unificados en el menú lateral | Resuelto |
| [#44](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/44) | 26/09 | Franco Testi | `api.md` con las rutas de misiones y sesiones | Resuelto |
| [#43](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/43) | 26/09 | Octavio Gudiño | Checklist de tiendas, verificación de inventarios y fecha de la evidencia de concurrencia | Resuelto |
| [#41](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/41) | 26/09 | Octavio Gudiño | Contraste de `api.md` con las rutas de comercio, evidencia de concurrencia y checklist de objetos | Resuelto |
| [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) | 24/09 | Renzo Scollo | Evidencia de tests, cobertura de integración, menú y tablas en pantalla chica; incluye datos de demo, respaldo, `api.md` revisada y el 413 de Emanuel Salomón | Resuelto |
| [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38) | 21/09 | Renzo Scollo | Auditoría responsive y de accesibilidad con sus correcciones | Resuelto |
| [#37](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/37) | 18/09 | Franco Testi | Mejoras en las pantallas de sesiones y misiones, con pruebas de integración | Resuelto |
| [#36](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/36) | 18/09 | Octavio Gudiño | Mejoras en la pantalla de objetos y la venta, pruebas de integración de comercio y evidencia de concurrencia | Resuelto |
| [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35) | 16/09 | Alejandro Ciesco | Clases, personajes y acceso a partidas, con pruebas | Resuelto |

Emanuel Salomón subió directo a `main` el 15/09 (sin PR) cuentas y perfiles (`ae80d88`), la documentación
de entrega (`a71bea7`), el aviso de backend caído (`1f0ec13`) y la guía de instalación de MySQL en
Windows (`18cb6dd`). Desde el 24/09 trabaja en ramas `ramaEmaIteracionN` que se fusionan por PR.

## Metodología de trabajo

- **Marco.** Desarrollo iterativo e incremental, con una modalidad afín al **Proceso Unificado**
  (Larman), acordada en la reunión del 3 de abril ([minutas.md](minutas.md)). Desde el 17 de julio
  hay una fase de implementación por semana, con entrega los jueves, y el trabajo se reparte por
  módulo entre los cinco integrantes.
- **Ramas.** Una rama por objetivo, creada desde `main` actualizado. Los integrantes usan ramas
  propias (`ramaEmaIteracionN`, `renzo/...`, `franco-...`, etc.) y fusionan por pull request.
- **Integración continua.** Nadie fusiona con la CI en rojo; la plantilla de PR
  ([`.github/pull_request_template.md`](../.github/pull_request_template.md)) lo recuerda. Los workflows
  están en `.github/workflows/`.
- **Pruebas.** Toda corrección funcional entra con su prueba. Lo que no se puede demostrar no se
  declara como hecho: las casillas de [pruebas_manuales.md](pruebas_manuales.md) se marcan solo
  después de ejecutarlas, con nombre y fecha.
- **Defectos.** Se anotan en la tabla de arriba con quién los encontró y el PR que los resuelve.
- **Reuniones.** Se registran en [minutas.md](minutas.md), con decisiones y tareas asignadas.
- **Congelamiento.** A partir del 9 de octubre no se agrega funcionalidad: solo se corrige y se ensaya.

## Defectos

| # | Fecha | Encontró | Defecto | Estado | Resolución |
| --- | --- | --- | --- | --- | --- |
| 1 | 14/09 | No registrado | `main` quedó sin compilar el frontend y la calificación de sesiones fallaba después de un merge con la CI en rojo | Resuelto | [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34), commit `d94cf81` |
| 2 | 15/09 | No registrado | Con el backend caído las pantallas mostraban el texto crudo `Error HTTP 502` | Resuelto | Commit `1f0ec13`, subido directo a `main` el 15/09 (sin PR) |
| 3 | 21/09 | Renzo Scollo | Desbordes a 375 px, contraste insuficiente y errores visibles solo en consola (detalle en [evidencia_calidad_visual.md](evidencia_calidad_visual.md)) | Resuelto | [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38), commits `025bf92` y `4fc9f5b` |
| 4 | 24/09 | Revisión de `api.md` | `docs/api.md` difería del código en 12 puntos: códigos de estado de `POST /personajes` (400, no 409) y de `/completar` con personajes repetidos (400), formato del 400 de `/usuarios`, `PUT /misiones` no parcial, condiciones de `/jugar`, `/finalizar` y `/calificar`, entre otros | Resuelto | Commit `0005c4a`; llegó a `main` el 24/09 y quedó incluido en [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) |
| 5 | 24/09 | Revisión de `api.md` | Un cuerpo JSON de más de 64 KB responde **500** «No se pudo completar la operación» en lugar de **413**: el manejador central de `src/app.ts` no reconoce el error de tamaño de `express.json` | Resuelto | `manejarErrores` responde **413** con un mensaje claro; prueba en `src/tests/errores.test.ts`. Commit `657a6f4`, incluido en [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) |
| 6 | 29/09 | No registrado (lo corrigió Renzo Scollo) | El archivo `.env` estaba versionado y `.env.example` no existía, contra la regla de no subir credenciales | Resuelto | Commit `a6aa413` en [#47](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/47) |
| 7 | 29/09 | No registrado (lo corrigió Renzo Scollo) | A 768 px el menú lateral desbordaba con las etiquetas nuevas | Resuelto | Commit `9461a71` en [#47](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/47) |

## Cómo agregar un defecto

1. Una fila nueva con el número siguiente, la fecha, quién lo encontró y qué se ve (qué se hizo y
   qué pasó, no la causa supuesta).
2. Estado **Abierto** hasta que haya una rama. Al abrir el PR, pasar a **En curso** y enlazarlo.
3. Al fusionar, **Resuelto** con el enlace al PR. Si se decide no corregirlo, **Justificado** con
   el motivo.
