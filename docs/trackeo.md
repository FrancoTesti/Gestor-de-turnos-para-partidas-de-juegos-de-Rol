# Trackeo de funcionalidades y correcciones

Registro de lo desarrollado, con quién lo hizo y el *pull request* que lo integró a `main`. Se
armó a partir del historial de commits y PR del repositorio. Complementa a
[seguimiento.md](seguimiento.md) (estado por módulo y defectos) y a [minutas.md](minutas.md)
(asignaciones por reunión). La metodología y el tablero están en [metodologia.md](metodologia.md).

Tipos: **feature** (funcionalidad nueva), **bugfix** (corrección), **test**, **docs**, **chore**
(estructura, herramientas, limpieza). Los PR se enlazan con el repositorio principal del equipo.

## Asignación por módulo

| Módulo | Responsable | Tareas principales |
| --- | --- | --- |
| Cuentas y perfiles | Emanuel Salomón | Cuentas, perfiles, documentación de entrega, datos de demo, migración a PostgreSQL (Supabase) |
| Clases, personajes y acceso a partidas | Alejandro Mario Ciesco | CRUD de clases, caso de uso Crear Personaje, acceso a partidas, verificación de instalación |
| Objetos, tiendas, inventarios, compra y venta | Octavio Alejandro Gudiño | Validaciones de usuario, compra, movimiento y venta de objetos, concurrencia y comercio |
| Partidas, sesiones, misiones y calificación | Franco Testi | Modelo de datos, CRUD de jugador, anfitrión y partida, sesiones, misiones, calificación, estilos |
| Transversal | Renzo Scollo | Backend en capas, entidades, autenticación, objetos, pruebas E2E, CI, responsive y accesibilidad |

## Funcionalidades y correcciones

### Base del proyecto (julio)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-05-15 | Primeras clases de la lógica del juego y su depuración | feature | Emanuel Salomón | [#1](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/1) |
| 2026-07-10 | Primera consulta funcionando contra la base de datos | feature | Emanuel Salomón | [#2](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/2) |
| 2026-07-17 | Reestructurar el repositorio y completar el modelo unificado | chore | Renzo Scollo | [#5](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/5) |
| 2026-07-17 | Eliminar archivos SQL de otra materia | chore | Renzo Scollo | [#6](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/6) |
| 2026-07-24 | Limitar `tsconfig` al backend | chore | Renzo Scollo | [#7](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/7) |
| 2026-07-24 | Las nueve entidades restantes del modelo relacional | feature | Renzo Scollo | [#8](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/8) |
| 2026-07-24 | Servidor Express (punto de entrada del backend) | feature | Renzo Scollo | [#9](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/9) |
| 2026-07-27 | Alinear el backend al material de la cátedra (CommonJS y ts-node) | chore | Renzo Scollo | [#10](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/10) |
| 2026-07-27 | Eliminar código muerto y un SQL duplicado | chore | Renzo Scollo | [#11](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/11) |
| 2026-07-31 | Uso de `parseInt` y validación del id en el controlador de usuarios | bugfix | Franco Testi | [#12](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/12) |

### Backend y primeros módulos (agosto)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-08-12 | Configuración de la base de datos y documentación | chore | Franco Testi | [#13](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/13) |
| 2026-08-12 | Quitar y restaurar el código de Node.js (retirado por error) | bugfix | Franco Testi | [#14](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/14), [#15](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/15) |
| 2026-08-13 | CRUD de usuarios integrado con la API | feature | Renzo Scollo | [#17](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/17) |
| 2026-08-16 | Validación con Zod y capa *repository* | feature | Franco Testi | [#18](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/18) |
| 2026-08-21 | CRUD de clases, objetos y tiendas con DTOs, validaciones y CORS | feature | Franco Testi | [#19](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/19) |
| 2026-08-24 | Módulos de jugador, anfitrión y partida, con su frontend | feature | Franco Testi | Sin PR propio (commits del 23 y 24/08) |
| 2026-08-24 | CRUD de clases y caso de uso Crear Personaje | feature | Alejandro Mario Ciesco | Sin PR propio (commit del 24/08) |
| 2026-08-24 | Eliminar `any` y estandarizar usuario | chore | Octavio Alejandro Gudiño | [#21](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/21) |
| 2026-08-28 | Frontend de objetos y organización de la documentación | feature | Renzo Scollo | [#22](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/22) |

### Integración, juego y comercio (septiembre)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-09-01 | Refactor de `UsersPage` y división del frontend en páginas y rutas | feature | Emanuel Salomón | [#23](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/23) |
| 2026-09-01 | Corregir y agregar validaciones de usuario | bugfix | Octavio Alejandro Gudiño | [#24](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/24) |
| 2026-09-02 | Compra transaccional de objetos | feature | Renzo Scollo | [#25](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/25) |
| 2026-09-07 | Autenticación, gestión de partidas e inventarios | feature | Renzo Scollo | [#26](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/26) |
| 2026-09-07 | CRUD de sesiones, participantes y calificación del anfitrión | feature | Franco Testi | [#27](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/27) |
| 2026-09-07 | Módulos de clases y personajes | feature | Alejandro Mario Ciesco | [#28](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/28) |
| 2026-09-07 | Cambios del módulo de comercio | feature | Octavio Alejandro Gudiño | [#29](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/29) |
| 2026-09-09 | Corregir la compilación del detalle de clases y unificar sesiones con el flujo autenticado | bugfix | Renzo Scollo | [#30](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/30) |
| 2026-09-09 | Cierre del requisito de objetos: compra, movimiento y venta | feature | Octavio Alejandro Gudiño | [#31](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/31) |
| 2026-09-11 | Flujo completo de sesiones y misiones | feature | Franco Testi | [#32](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/32) |
| 2026-09-14 | Pruebas E2E, página amigable para rutas inexistentes e integración continua | test | Renzo Scollo | [#33](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/33) |
| 2026-09-14 | Reparar el build del frontend y la calificación de sesiones | bugfix | Renzo Scollo | [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34) |
| 2026-09-15 | Cuentas y perfiles de usuario; aviso cuando el backend está caído | feature | Emanuel Salomón | Sin PR propio (commits del 15/09) |
| 2026-09-16 | Módulo de clases, personajes y acceso a partidas, con pruebas | feature | Alejandro Mario Ciesco | [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35) |
| 2026-09-18 | Mejoras y cambios del comercio | feature | Octavio Alejandro Gudiño | [#36](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/36) |
| 2026-09-18 | Tareas de las semanas 17 a 23 | feature | Franco Testi | [#37](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/37) |
| 2026-09-21 | Responsive, contraste y avisos de error; auditoría de accesibilidad y cobertura | bugfix | Renzo Scollo | [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38) |
| 2026-09-24 | Respuesta 413 con mensaje claro; datos de demo reproducibles; `api.md` revisada | bugfix | Emanuel Salomón | Sin PR propio (commits del 24/09) |
| 2026-09-24 | Evidencia de pruebas, menú en pantalla chica y cobertura de integración | test | Renzo Scollo | [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) |
| 2026-09-26 | Verificación de concurrencia, rutas de inventarios y checklist de tiendas | docs | Octavio Alejandro Gudiño | [#41](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/41), [#43](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/43) |
| 2026-09-26 | `api.md` con las rutas de misiones y sesiones; unificar emojis del menú | docs | Franco Testi | [#44](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/44), [#45](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/45) |
| 2026-09-29 | Verificación de instalación y checklist de clases y personajes | docs | Alejandro Mario Ciesco | [#46](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/46) |
| 2026-09-29 | Dejar de versionar `.env` y recuperar `.env.example` | bugfix | Renzo Scollo | [#47](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/47) |
| 2026-09-29 | Cubrir caminos de error de `ClaseController` y `JugadorController`; evitar desborde del menú a 768 px | test | Renzo Scollo | [#48](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/48) |

### Migración a PostgreSQL y rediseño del frontend (octubre)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-10-07 | Arreglos del CI del backend (validación de anfitrión) y de hooks en `UsuarioDetalle` | bugfix | Revisor automático (Copilot) | [#51](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/51), [#53](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/53), [#56](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/56) |
| 2026-10-07 | Migración de MySQL a PostgreSQL (Supabase), con pruebas sobre esquema temporal y scripts `db:rls` y `db:probar` | feature | Emanuel Salomón | [#54](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/54) |
| 2026-10-07 | Deshacer los cambios de frontend que dejaban `main` en rojo | bugfix | Franco Testi y Emanuel Salomón | [#52](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/52), [#55](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/55) |
| 2026-10-07 | `TUTORIAL.md` para ponerse al día tras la migración | docs | Emanuel Salomón | [#57](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/57) |
| 2026-10-08 | Rediseño del frontend: barra superior con menús, formularios, avatares y visor de imágenes; corrección de hooks y del desborde a 375 px | feature | Franco Testi (diseño) y Renzo Scollo (ajustes de CI) | [#58](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/58) |

## Defectos

El registro de defectos, con quién los encontró y cómo se resolvieron, está en
[seguimiento.md](seguimiento.md#defectos).
