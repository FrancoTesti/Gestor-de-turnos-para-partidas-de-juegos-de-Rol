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
| Cuentas y perfiles | Emanuel Salomón | Sí | Pendiente |
| Clases, personajes y acceso a partidas | Alejandro Mario Ciesco | Sí | Pendiente |
| Objetos, tiendas, inventarios, compra y venta | Octavio Alejandro Gudiño | Sí | 7 casillas ejecutadas el 25/09 |
| Partidas, sesiones, misiones y calificación | Franco Testi | Sí | 4 casillas ejecutadas el 18/09 |
| Transversal: responsive, accesibilidad, E2E, CI | Renzo Scollo | Sí | Pendiente |

Actualizar la última columna cuando cada uno marque sus casillas en `pruebas_manuales.md`. Las dos
últimas casillas (acceso ajeno por HTTP y revisión de escritorio/móvil, tema y teclado) no tienen
responsable todavía.

## Defectos

| # | Fecha | Encontró | Defecto | Estado | Resolución |
| --- | --- | --- | --- | --- | --- |
| 1 | 14/09 | No registrado | `main` quedó sin compilar el frontend y la calificación de sesiones fallaba después de un merge con la CI en rojo | Resuelto | [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34), commit `d94cf81` |
| 2 | 15/09 | No registrado | Con el backend caído las pantallas mostraban el texto crudo `Error HTTP 502` | Resuelto | [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35), commit `1f0ec13` |
| 3 | 21/09 | Renzo Scollo | Desbordes a 375 px, contraste insuficiente y errores visibles solo en consola (detalle en [evidencia_calidad_visual.md](evidencia_calidad_visual.md)) | Resuelto | [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38), commits `025bf92` y `4fc9f5b` |
| 4 | 24/09 | Revisión de `api.md` | `docs/api.md` difería del código en 12 puntos: códigos de estado de `POST /personajes` (400, no 409) y de `/completar` con personajes repetidos (400), formato del 400 de `/usuarios`, `PUT /misiones` no parcial, condiciones de `/jugar`, `/finalizar` y `/calificar`, entre otros | En curso | Corregido en `docs/api.md` en la rama `ramaEmaIteracion4` |
| 5 | 24/09 | Revisión de `api.md` | Un cuerpo JSON de más de 64 KB responde **500** «No se pudo completar la operación» en lugar de **413**: el manejador central de `src/app.ts` no reconoce el error de tamaño de `express.json` | En curso | `manejarErrores` responde **413** «Los datos enviados superan el límite de 64 KB. Acortá el texto e intentá de nuevo.»; prueba en `src/tests/errores.test.ts` (falla sin la corrección). Rama `ramaEmaIteracion4` |

## Cómo agregar un defecto

1. Una fila nueva con el número siguiente, la fecha, quién lo encontró y qué se ve (qué se hizo y
   qué pasó, no la causa supuesta).
2. Estado **Abierto** hasta que haya una rama. Al abrir el PR, pasar a **En curso** y enlazarlo.
3. Al fusionar, **Resuelto** con el enlace al PR. Si se decide no corregirlo, **Justificado** con
   el motivo.
