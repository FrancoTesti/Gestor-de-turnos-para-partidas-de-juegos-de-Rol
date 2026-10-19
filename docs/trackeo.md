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
| **Backend — Modelo ORM/SQL, Catálogo Base y Personajes** | Alejandro Mario Ciesco | Modelado de entidades (`src/entities/*.entity.ts`), esquema `SQL/rpg.sql`, configuración `mikro-orm.config.ts` y capas completas (DTO, validador, servicio, controlador, ruta y tests unitarios) de **Clases**, **Tiendas** y **Personajes** (alta con Inventario #1, filtro por clase y baja segura) |
| **Backend — Servidor Express, Seguridad, Autenticación y Cuentas** | Emanuel Salomón | Servidor Express (`src/app.ts`, CORS, CSRF, `RequestContext`, `handleErrors`), seguridad (`scrypt`, `timingSafeEqual`, cookies `HttpOnly`/`SameSite=Strict`, `authorization.ts`), módulos de **Usuarios**, **Jugadores** y **Anfitriones**, migración a PostgreSQL (Supabase) y scripts |
| **Backend — Líder de Proyecto y Motor Transaccional de Juego y Comercio** | Franco Testi | Módulos de **Partidas**, **Sesiones**, **Misiones**, **Karma**, **Inventarios** y **Objetos/Comercio** (`match.service.ts`, `game.service.ts`, `item.service.ts`, `item.rules.ts`, `sale.rules.ts`), bloqueos pesimistas (`PESSIMISTIC_WRITE` con `select-in`), integración en PostgreSQL y despliegue en Render |
| **Frontend — Arquitectura React SPA, UI, Cuentas y Flujo de Turnos** | Renzo Scollo | Enrutamiento (`App.tsx`), contextos (`UserContext`, `ThemeContext`), layout (`MainLayout`), cliente HTTP (`api.ts`), biblioteca UI (`components/ui/`), pantallas de **Login/Registro/Perfiles/Usuarios**, flujo de **Partidas, Sesiones y Misiones**, accesibilidad WCAG 2 AA, E2E con Playwright y CI/CD |
| **Frontend — Interfaces de Dominio RPG, Comercio e Inventarios** | Octavio Alejandro Gudiño | Contratos TypeScript (`interfaces.ts`), servicios cliente de dominio y pantallas/componentes de **Personajes**, **Clases**, **Tiendas**, **Catálogo de Objetos**, formularios de **Compra y Venta** (`PurchaseItemForm`, `SaleItemForm`), **Gestor de Inventarios** (`ModulePage.tsx`) y pruebas unitarias de interfaz |

## Funcionalidades y correcciones

### Base del proyecto (julio)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-05-15 | Primeras clases de la lógica del juego y su depuración | feature | Alejandro Mario Ciesco | [#1](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/1) |
| 2026-07-10 | Primera consulta funcionando contra la base de datos | feature | Emanuel Salomón | [#2](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/2) |
| 2026-07-17 | Reestructurar el repositorio y completar el modelo de interfaces en el frontend | chore | Octavio Alejandro Gudiño y Renzo Scollo | [#5](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/5) |
| 2026-07-17 | Depurar archivos SQL y consolidar `SQL/rpg.sql` | chore | Alejandro Mario Ciesco | [#6](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/6) |
| 2026-07-24 | Configurar `tsconfig` y `mikro-orm.config.ts` del backend | chore | Alejandro Mario Ciesco | [#7](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/7) |
| 2026-07-24 | Definición de las entidades del modelo relacional en `src/entities/` | feature | Alejandro Mario Ciesco | [#8](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/8) |
| 2026-07-24 | Servidor Express (`src/app.ts`, punto de entrada del backend) | feature | Emanuel Salomón | [#9](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/9) |
| 2026-07-27 | Alinear el backend al material de la cátedra (CommonJS y ts-node) | chore | Emanuel Salomón | [#10](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/10) |
| 2026-07-27 | Eliminar código muerto y un SQL duplicado | chore | Alejandro Mario Ciesco | [#11](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/11) |
| 2026-07-31 | Uso de `parseInt` y validación del id en el controlador de usuarios | bugfix | Emanuel Salomón | [#12](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/12) |

### Backend y primeros módulos (agosto)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-08-12 | Configuración de la base de datos (`mikro-orm.config.ts`) y validación de entidades | chore | Alejandro Mario Ciesco | [#13](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/13) |
| 2026-08-12 | Quitar y restaurar el código de Node.js (retirado por error) | bugfix | Franco Testi | [#14](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/14), [#15](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/15) |
| 2026-08-13 | CRUD de usuarios integrado entre backend (`user.*`) y frontend (`UsersPage`) | feature | Emanuel Salomón (Backend) y Renzo Scollo (Frontend) | [#17](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/17) |
| 2026-08-16 | Validación con Zod (`user.schema.ts`) y capa `user.repository.ts` | feature | Emanuel Salomón | [#18](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/18) |
| 2026-08-21 | CRUD de clases y tiendas con DTOs, validaciones y controladores en backend | feature | Alejandro Mario Ciesco | [#19](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/19) |
| 2026-08-24 | Módulos backend de jugador y anfitrión (`player.*`, `host.*`) y módulo de partida (`match.*`) | feature | Emanuel Salomón y Franco Testi | Sin PR propio (commits del 23 y 24/08) |
| 2026-08-24 | CRUD de clases, tiendas y caso de uso Crear Personaje en backend (`character.*`) | feature | Alejandro Mario Ciesco | Sin PR propio (commit del 24/08) |
| 2026-08-24 | Tipado estricto de interfaces en `frontend/src/interfaces.ts` eliminando `any` | chore | Octavio Alejandro Gudiño | [#21](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/21) |
| 2026-08-28 | Frontend de objetos (`components/objetos/`) y pantallas de catálogo | feature | Octavio Alejandro Gudiño | [#22](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/22) |

### Integración, juego y comercio (septiembre)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-09-01 | Refactor de `UsersPage` y división del frontend en páginas y rutas con `App.tsx` y `MainLayout` | feature | Renzo Scollo | [#23](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/23) |
| 2026-09-01 | Corregir y agregar validaciones de usuario (`user.validator.ts` y `user.schema.ts`) | bugfix | Emanuel Salomón | [#24](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/24) |
| 2026-09-02 | Compra transaccional de objetos en backend (`item.service.ts`) y formulario `PurchaseItemForm` en frontend | feature | Franco Testi (Backend) y Octavio Alejandro Gudiño (Frontend) | [#25](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/25) |
| 2026-09-07 | Autenticación en backend (`auth.ts`, `authorization.ts`) y contexto/pantallas en frontend (`UserContext`, `LoginPage`, `RegisterPage`) | feature | Emanuel Salomón (Backend) y Renzo Scollo (Frontend) | [#26](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/26) |
| 2026-09-07 | CRUD de sesiones, participantes y calificación del anfitrión en `game.service.ts` | feature | Franco Testi | [#27](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/27) |
| 2026-09-07 | Módulos de clases, tiendas y personajes en backend (`class.*`, `shop.*`, `character.*`) y sus pantallas en frontend (`ClassesPage`, `ShopsPage`, `CharactersPage`) | feature | Alejandro Mario Ciesco (Backend) y Octavio Alejandro Gudiño (Frontend) | [#28](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/28) |
| 2026-09-07 | Componentes y pantallas del módulo de comercio e inventarios en frontend (`ShopsPage`, `ItemsPage`, `ModulePage`) | feature | Octavio Alejandro Gudiño | [#29](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/29) |
| 2026-09-09 | Corregir la compilación del frontend y unificar `SessionsPage` con el flujo autenticado | bugfix | Renzo Scollo | [#30](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/30) |
| 2026-09-09 | Cierre del requisito de objetos: compra, movimiento y venta (`item.service.ts`, `game.service.ts` y formularios `PurchaseItemForm`/`SaleItemForm`) | feature | Franco Testi (Backend) y Octavio Alejandro Gudiño (Frontend) | [#31](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/31) |
| 2026-09-11 | Flujo completo de partidas, sesiones y misiones en backend (`game.service.ts`) y en frontend (`SessionsPage`, `MissionsPage`) | feature | Franco Testi (Backend) y Renzo Scollo (Frontend) | [#32](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/32) |
| 2026-09-14 | Pruebas E2E, `NotFoundPage` e integración continua en GitHub Actions | test | Renzo Scollo | [#33](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/33) |
| 2026-09-14 | Reparar el build del frontend y la calificación de sesiones en `SessionsPage.tsx` | bugfix | Renzo Scollo | [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34) |
| 2026-09-15 | Cuentas, perfiles de usuario y seguridad (`scrypt` y cookies `HttpOnly`) en backend y `ProfilesPage.tsx` en frontend | feature | Emanuel Salomón (Backend) y Renzo Scollo (Frontend) | Commits del 15/09 (integrados en [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35)) |
| 2026-09-16 | Módulo de clases, tiendas y creación de personajes con inventario inicial #1 y pruebas unitarias | feature | Alejandro Mario Ciesco | [#35](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/35) |
| 2026-09-18 | Mejoras de interfaz en componentes de objetos, tiendas e inventarios (`ItemsPage`, `ShopsPage`, `ModulePage`) | feature | Octavio Alejandro Gudiño | [#36](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/36) |
| 2026-09-18 | Reglas transaccionales de partidas, sesiones y misiones (`match.service.ts`, `game.service.ts`, `game.test.ts`) | feature | Franco Testi | [#37](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/37) |
| 2026-09-21 | Responsive, contraste y avisos de error; auditoría de accesibilidad (`axe-core`) y cobertura | bugfix | Renzo Scollo | [#38](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/38) |
| 2026-09-24 | Respuesta 413 con mensaje claro (`657a6f4`) en `app.ts`; datos de demo reproducibles; `api.md` revisada | bugfix | Emanuel Salomón | Commits del 24/09 (integrados en [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40)) |
| 2026-09-24 | Evidencia de pruebas, menú en pantalla chica y cobertura de integración | test | Renzo Scollo | [#40](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/40) |
| 2026-09-26 | Verificación de concurrencia en `game.test.ts` y rutas de inventarios/tiendas | docs | Franco Testi y Octavio Alejandro Gudiño | [#41](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/41), [#43](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/43) |
| 2026-09-26 | `api.md` con las rutas de misiones y sesiones; unificar iconografía inicial del menú | docs | Franco Testi y Renzo Scollo | [#44](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/44), [#45](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/45) |
| 2026-09-29 | Verificación de modelo ORM, clases, tiendas y personajes (`class.*`, `shop.*`, `character.*`) | docs | Alejandro Mario Ciesco | [#46](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/46) |
| 2026-09-29 | Dejar de versionar `.env` y recuperar `.env.example` | bugfix | Emanuel Salomón | [#47](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/47) |
| 2026-09-29 | Cubrir caminos de error de `ClassController` y `PlayerController`; evitar desborde del menú a 768 px | test | Alejandro Mario Ciesco, Emanuel Salomón y Renzo Scollo | [#48](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/48) |

### Migración a PostgreSQL, rediseño del frontend y despliegue en producción (octubre)

| Fecha | Tarea | Tipo | Responsable | PR |
| --- | --- | --- | --- | --- |
| 2026-10-07 | Arreglos del CI del backend (validación de anfitrión) y de hooks en `UserDetail` | bugfix | Emanuel Salomón (Backend) y Renzo Scollo (Frontend) | [#51](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/51), [#53](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/53), [#56](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/56) |
| 2026-10-07 | Migración de MySQL a PostgreSQL (Supabase), bloqueo pesimista con `select-in`, pruebas sobre esquema temporal y scripts `db:rls` y `db:probar` | feature | Emanuel Salomón, Alejandro Mario Ciesco y Franco Testi | [#54](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/54) |
| 2026-10-07 | Deshacer preventivamente los cambios de frontend que dejaban `main` en rojo | bugfix | Renzo Scollo y Octavio Alejandro Gudiño | [#52](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/52), [#55](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/55) |
| 2026-10-07 | `TUTORIAL.md` para ponerse al día tras la migración | docs | Emanuel Salomón | [#57](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/57) |
| 2026-10-08 | Rediseño del frontend: barra superior con menús, formularios, avatares y visor de imágenes; corrección de hooks y del desborde a 375 px | feature | Renzo Scollo y Octavio Alejandro Gudiño | [#58](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/58) |
| 2026-10-08 | Documentación de metodología ágil (Scrum/Kanban), seguimiento y depuración de archivos de verificación | docs | Franco Testi y Emanuel Salomón | [#59](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/59), [#60](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/60), [#61](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/61) |
| 2026-10-08 | Soporte dinámico de temas claro/oscuro (`ThemeContext`, `ThemeToggle`), auditoría WCAG 2 AA, pruebas unitarias de layout y evolución visual *Bento Grid* | feature | Renzo Scollo y Octavio Alejandro Gudiño | [#63](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/63), [#64](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/64), [#65](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/65), [#66](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/66) |
| 2026-10-09 | Segregación estricta de roles (Jugador/Anfitrión), tiendas y misiones por partida, objetos únicos y venta instantánea | feature | Emanuel Salomón, Alejandro Mario Ciesco y Franco Testi (Backend); Renzo Scollo y Octavio Alejandro Gudiño (Frontend) | [#67](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/67) |
| 2026-10-12 | Reemplazo de emojis por iconografía SVG (`Icons.tsx`), sistema unificado de avisos en español (`NoticeModal`), contexto de partida en personajes y robustez de selectores E2E | feature | Renzo Scollo y Octavio Alejandro Gudiño | [#68](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/68), [#69](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/69) |
| 2026-10-13 | Resolución integral de advertencias de linter (`oxlint`) en frontend y aislamiento de pruebas de integración con `TEST_DB_URL` | bugfix | Renzo Scollo y Franco Testi | [#70](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/70) |
| 2026-10-13 | Optimización de la tienda del anfitrión (`shop.service.ts` / `ShopsPage.tsx`) y administración de catálogo e inventario | feature | Alejandro Mario Ciesco (Backend) y Octavio Alejandro Gudiño (Frontend) | [#71](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/71) |
| 2026-10-14 | Compra ilimitada de objetos comunes (clonación de instancias en `item.service.ts`), autoasignación de casillero, catálogo limpio en `ShopsPage`/`ItemsPage` y validación estricta de nivel requerido | feature | Franco Testi (Backend) y Octavio Alejandro Gudiño (Frontend) | [#72](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/72), [#73](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/73), [#76](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/76) |
| 2026-10-14 | Configuración de despliegue Same-Origin en Render (`build:all`), ruta `/partidas/activas` y actualización de documentación de despliegue, demo y minutas | feature | Franco Testi y Emanuel Salomón | [#74](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/74), [#75](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/75) |
| 2026-10-14 | Mejoras de UI mobile, paginación de directorio, acceso directo a inventarios filtrados por personaje (`CharactersPage`/`ModulePage`) y ajustes responsivos de catálogo y venta | feature | Renzo Scollo y Octavio Alejandro Gudiño | [#77](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/77), [#78](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/78), [#79](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/79) |
| 2026-10-16 | Estandarización de nombres de archivos y funciones al inglés en backend y frontend (preservando API y UI en español) y enlace al video de demostración en `TUTORIAL.md` | chore | Alejandro Mario Ciesco, Emanuel Salomón y Franco Testi (Backend); Renzo Scollo y Octavio Alejandro Gudiño (Frontend) | [#80](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/80) |


## Defectos

El registro de defectos, con quién los encontró y cómo se resolvieron, está en
[seguimiento.md](seguimiento.md#defectos).
