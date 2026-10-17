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
| Líder de Proyecto, Backend Core y Ciclo de Partidas | Franco Testi | Arquitectura Express (`RequestContext`), configuración MikroORM, modelo de dominio, CRUD de jugador, anfitrión y partida, sesiones, misiones, calificación, diseño UI y despliegue Same-Origin en Render |
| Motor de Economía, Catálogos y Persistencia Concurrente | Octavio Alejandro Gudiño | Catálogos de tiendas, objetos únicos y comunes clonados, inventarios, transacciones atómicas de compra y venta, reglas de reventa y bloqueos pesimistas (`PESSIMISTIC_WRITE` con `select-in`) |
| Seguridad, Cuentas, Criptografía e Infraestructura de Datos | Emanuel Salomón | Autenticación con cookies `HttpOnly`/`SameSite=Strict`, hashing `scrypt` (`timingSafeEqual`), identidad polimórfica y autorización por rol, migración a PostgreSQL (Supabase), datos de demo y documentación de entrega |
| Clases, Personajes, Reglas de Negocio e Inventarios Base | Alejandro Mario Ciesco | CRUD de clases, creación atómica de personaje e inventario base #1, validaciones de nivel requerido, cupos y acceso a partidas públicas/privadas, movimiento de objetos entre inventarios y verificación de instalación |
| Transversal: Frontend SPA, Calidad, Testing y CI/CD | Renzo Scollo | Arquitectura React SPA (`UserContext`, cliente HTTP `api.ts`), diseño responsive y multi-tema, accesibilidad WCAG 2.0 A/AA (`axe-core`), pirámide de pruebas (Vitest unitario/integración y Playwright E2E) y GitHub Actions |

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
| 2026-09-07 | Autenticación, gestión de partidas e inventarios | feature | Renzo Scollo y Emanuel Salomón | [#26](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/26) |
| 2026-09-07 | CRUD de sesiones, participantes y calificación del anfitrión | feature | Franco Testi | [#27](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/27) |
| 2026-09-07 | Módulos de clases y personajes | feature | Alejandro Mario Ciesco | [#28](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/28) |
| 2026-09-07 | Cambios del módulo de comercio | feature | Octavio Alejandro Gudiño | [#29](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/29) |
| 2026-09-09 | Corregir la compilación del detalle de clases y unificar sesiones con el flujo autenticado | bugfix | Renzo Scollo | [#30](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/30) |
| 2026-09-09 | Cierre del requisito de objetos: compra, movimiento y venta | feature | Octavio Alejandro Gudiño | [#31](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/31) |
| 2026-09-11 | Flujo completo de sesiones y misiones | feature | Franco Testi | [#32](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/32) |
| 2026-09-14 | Pruebas E2E, página amigable para rutas inexistentes e integración continua | test | Renzo Scollo | [#33](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/33) |
| 2026-09-14 | Reparar el build del frontend y la calificación de sesiones | bugfix | Renzo Scollo | [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34) |
| 2026-09-15 | Cuentas, perfiles de usuario y seguridad (`scrypt` y cookies `HttpOnly`); aviso cuando el backend está caído (`1f0ec13`) | feature | Emanuel Salomón | Commits del 15/09 (integrados en [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35)) |
| 2026-09-16 | Módulo de clases, creación atómica de personajes e inventario base y acceso a partidas, con pruebas | feature | Alejandro Mario Ciesco | [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35) |
| 2026-09-18 | Mejoras y cambios del comercio | feature | Octavio Alejandro Gudiño | [#36](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/36) |
| 2026-09-18 | Tareas de las semanas 17 a 23 (partidas, sesiones y misiones) | feature | Franco Testi | [#37](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/37) |
| 2026-09-21 | Responsive, contraste y avisos de error; auditoría de accesibilidad (`axe-core`) y cobertura | bugfix | Renzo Scollo | [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38) |
| 2026-09-24 | Respuesta 413 con mensaje claro (`657a6f4`); datos de demo reproducibles; `api.md` revisada | bugfix | Emanuel Salomón | Commits del 24/09 (integrados en [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40)) |
| 2026-09-24 | Evidencia de pruebas, menú en pantalla chica y cobertura de integración | test | Renzo Scollo | [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) |
| 2026-09-26 | Verificación de concurrencia, rutas de inventarios y checklist de tiendas | docs | Octavio Alejandro Gudiño | [#41](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/41), [#43](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/43) |
| 2026-09-26 | `api.md` con las rutas de misiones y sesiones; unificar iconografía inicial del menú | docs | Franco Testi | [#44](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/44), [#45](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/45) |
| 2026-09-29 | Verificación de instalación y checklist de clases y personajes | docs | Alejandro Mario Ciesco | [#46](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/46) |
| 2026-09-29 | Dejar de versionar `.env` y recuperar `.env.example` | bugfix | Renzo Scollo | [#47](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/47) |
| 2026-09-29 | Cubrir caminos de error de `ClassController` y `PlayerController`; evitar desborde del menú a 768 px | test | Renzo Scollo | [#48](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/48) |

### Migración a PostgreSQL, rediseño del frontend y despliegue en producción (octubre)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-10-07 | Arreglos del CI del backend (validación de anfitrión) y de hooks en `UserDetail` | bugfix | Renzo Scollo (con revisor automático Copilot) | [#51](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/51), [#53](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/53), [#56](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/56) |
| 2026-10-07 | Migración de MySQL a PostgreSQL (Supabase), bloqueo pesimista con `select-in`, pruebas sobre esquema temporal y scripts `db:rls` y `db:probar` | feature | Emanuel Salomón y Octavio Alejandro Gudiño | [#54](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/54) |
| 2026-10-07 | Deshacer preventivamente los cambios de frontend que dejaban `main` en rojo | bugfix | Franco Testi y Emanuel Salomón | [#52](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/52), [#55](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/55) |
| 2026-10-07 | `TUTORIAL.md` para ponerse al día tras la migración | docs | Emanuel Salomón | [#57](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/57) |
| 2026-10-08 | Rediseño del frontend: barra superior con menús, formularios, avatares y visor de imágenes; corrección de hooks y del desborde a 375 px | feature | Franco Testi (diseño) y Renzo Scollo (ajustes de CI) | [#58](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/58) |
| 2026-10-08 | Documentación de metodología ágil (Scrum/Kanban), seguimiento y depuración de archivos de verificación | docs | Franco Testi y Emanuel Salomón | [#59](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/59), [#60](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/60), [#61](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/61) |
| 2026-10-08 | Soporte dinámico de temas claro/oscuro (`ThemeContext`, `ThemeToggle`), auditoría WCAG 2 AA, pruebas unitarias de layout y evolución visual *Bento Grid* | feature | Renzo Scollo y Franco Testi | [#63](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/63), [#64](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/64), [#65](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/65), [#66](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/66) |
| 2026-10-09 | Segregación estricta de roles (Jugador/Anfitrión), tiendas y misiones por partida, objetos únicos y venta instantánea | feature | Emanuel Salomón, Franco Testi, Alejandro Mario Ciesco y Octavio Alejandro Gudiño | [#67](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/67) |
| 2026-10-12 | Reemplazo de emojis por iconografía SVG, sistema unificado de avisos en español (`NoticeModal`), contexto de partida en personajes y robustez de selectores E2E | feature | Franco Testi, Alejandro Mario Ciesco y Renzo Scollo | [#68](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/68), [#69](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/69) |
| 2026-10-13 | Resolución integral de advertencias de linter (`oxlint`) en frontend y aislamiento de pruebas de integración con `TEST_DB_URL` | bugfix | Renzo Scollo | [#70](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/70) |
| 2026-10-13 | Optimización de la tienda del anfitrión y administración de catálogo e inventario | feature | Octavio Alejandro Gudiño | [#71](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/71) |
| 2026-10-14 | Compra ilimitada de objetos comunes (clonación de instancias), autoasignación de casillero, catálogo limpio y validación estricta de nivel requerido en compras | feature | Octavio Alejandro Gudiño y Alejandro Mario Ciesco | [#72](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/72), [#73](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/73), [#76](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/76) |
| 2026-10-14 | Configuración de despliegue Same-Origin en Render (`build:all`), ruta `/partidas/activas` y actualización de documentación de despliegue, demo y minutas | feature | Franco Testi y Emanuel Salomón | [#74](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/74), [#75](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/75) |
| 2026-10-14 | Mejoras de UI mobile, paginación de directorio, acceso directo a inventarios filtrados por personaje y ajustes responsivos de catálogo y venta | feature | Franco Testi, Alejandro Mario Ciesco y Renzo Scollo | [#77](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/77), [#78](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/78), [#79](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/79) |
| 2026-10-16 | Estandarización de nombres de archivos y funciones al inglés en backend y frontend (preservando API y UI en español) y enlace al video de demostración en `TUTORIAL.md` | chore | Franco Testi, Renzo Scollo y Emanuel Salomón | [#80](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/80) |

## Defectos

El registro de defectos, con quién los encontró y cómo se resolvieron, está en
[seguimiento.md](seguimiento.md#defectos).
