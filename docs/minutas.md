# Minutas de reunión

> Registro de reuniones de seguimiento, acuerdos técnicos y coordinación del equipo de desarrollo.
> Refleja el trabajo colaborativo, las decisiones arquitectónicas consensuadas y la evolución del proyecto.

## Equipo de desarrollo

| Integrante | Rol en la defensa y áreas principales de desarrollo |
| --- | --- |
| Alejandro Mario Ciesco | **Backend — Modelado de Datos Relacional (ORM/SQL), Catálogo Base y Personajes:** definición de entidades decoradas (`src/entities/`), esquema `SQL/rpg.sql`, configuración `mikro-orm.config.ts` y capas backend completas (DTO, validador, servicio, controlador, ruta y tests unitarios) de **Clases**, **Tiendas** y **Personajes** (alta con Inventario #1, filtro por clase y baja segura) |
| Emanuel Salomón | **Backend — Servidor Express, Seguridad, Autenticación y Cuentas:** punto de entrada `src/app.ts` (CORS, CSRF, `RequestContext`, `handleErrors`), criptografía (`scrypt`, `timingSafeEqual`), sesiones con cookies `HttpOnly`/`SameSite=Strict`, autorización por rol (`authorization.ts`), módulos de **Usuarios**, **Jugadores** y **Anfitriones**, migración a PostgreSQL (Supabase) y scripts |
| Franco Testi | **Backend — Líder de Proyecto y Motor de Juego Transaccional:** módulos de **Partidas**, **Sesiones**, **Misiones**, **Calificación (Karma)**, **Inventarios** y **Objetos/Comercio** (`match.service.ts`, `game.service.ts`, `item.service.ts`, `item.rules.ts`, `sale.rules.ts`), bloqueos pesimistas (`PESSIMISTIC_WRITE` con `select-in`), integración en PostgreSQL y despliegue en Render |
| Renzo Scollo | **Frontend — Arquitectura React SPA, Estado Global, UI, Cuentas y Turnos:** enrutamiento (`App.tsx`), contextos (`UserContext`, `ThemeContext`), layout (`MainLayout`), cliente HTTP (`api.ts`), biblioteca UI (`components/ui/`), pantallas de **Login/Registro/Perfiles/Usuarios**, flujo de **Partidas, Sesiones y Misiones**, accesibilidad WCAG 2.0 A/AA (`axe-core`), E2E con Playwright y CI/CD |
| Octavio Alejandro Gudiño | **Frontend — Interfaces de Dominio RPG, Catálogo, Comercio e Inventarios:** contratos TypeScript (`interfaces.ts`), servicios cliente de dominio y pantallas/componentes de **Personajes**, **Clases**, **Tiendas**, **Catálogo de Objetos**, formularios de **Compra y Venta** (`PurchaseItemForm`, `SaleItemForm`), **Gestor de Inventarios** (`ModulePage.tsx`) y pruebas unitarias de interfaz |

## Minutas

<!-- Agregar las minutas acá, la más reciente primero. -->

## 2026-10-16 — Estandarización de código al inglés, cierre de interfaz móvil y organización de la defensa oral

- **Participantes:** Franco Testi, Octavio Gudiño, Emanuel Salomón, Alejandro Ciesco, Renzo Scollo.
- **Modalidad:** Reunión sincrónica de cierre técnico y planificación de la exposición oral.

### Temas tratados

- **Mejoras finales de interfaz móvil, directorio e inventarios (PR #76, #77, #78 y #79):** Se integraron los ajustes finales de navegación móvil, paginación del directorio, acceso directo a inventarios filtrados por personaje (`CharactersPage` y `ModulePage`), indicadores visuales de objetos únicos ya adquiridos y optimización de modales y formularios de compra y venta en resoluciones pequeñas (Renzo Scollo y Octavio Gudiño).
- **Estandarización de nombres de archivos y funciones al inglés (PR #80):** Se tradujeron los nombres de archivos y métodos internos del backend y frontend al inglés (`class.service.ts`, `shop.service.ts`, `character.service.ts`, `user.service.ts`, `game.service.ts`, `item.service.ts`, `sale.rules.ts`, `src/integration/game.test.ts`, `ShopsPage.tsx`, `SessionsPage.tsx`, `MissionsPage.tsx`, `NoticeModal.tsx`), preservando intactos los contratos HTTP de la API, la base de datos y los textos de interfaz en español (Alejandro Ciesco, Emanuel Salomón y Franco Testi en Backend; Renzo Scollo y Octavio Gudiño en Frontend).
- **Publicación del video de demostración y actualización de guías (PR #75 y commits en `TUTORIAL.md`):** Se incorporó el enlace al video de demostración grabado en Google Drive dentro de `TUTORIAL.md` y se sincronizaron las minutas y guías de despliegue (Emanuel Salomón y Franco Testi).
- **Organización de la defensa oral y reparto de bloques:** El equipo definió la estructura de exposición y demostración en vivo (con dos navegadores en paralelo para Anfitrión y Jugador) dividida en cinco bloques técnicos (3 de Backend y 2 de Frontend) alineados con los módulos desarrollados:
  1. **Alejandro Ciesco (Backend):** Modelado de datos relacional (`src/entities/`, `SQL/rpg.sql`, `mikro-orm.config.ts`), patrón DTO y capas backend completas de **Clases**, **Tiendas** y **Personajes** (alta con Inventario inicial #1, validaciones y baja segura).
  2. **Emanuel Salomón (Backend):** Arquitectura del servidor Express (`src/app.ts`, `RequestContext`, CORS/CSRF, `handleErrors`), seguridad y criptografía (`scrypt`, `timingSafeEqual`, cookies `HttpOnly`/`SameSite=Strict`), autorización por rol (`authorization.ts`) y módulos de **Usuarios**, **Jugadores** y **Anfitriones**.
  3. **Franco Testi (Backend):** Motor de juego transaccional: módulos de **Partidas**, **Sesiones**, **Misiones**, **Karma**, **Inventarios** y **Objetos/Comercio** (`match.service.ts`, `game.service.ts`, `item.service.ts`), clonación de objetos comunes frente a transferencia de únicos, bloqueos pesimistas (`LockMode.PESSIMISTIC_WRITE` con `strategy: 'select-in'`) y pruebas de integración en PostgreSQL.
  4. **Renzo Scollo (Frontend):** Arquitectura Frontend SPA en React (`App.tsx`, `UserContext`, `ThemeContext`, `MainLayout`), cliente HTTP (`api.ts`), biblioteca de componentes `ui/`, pantallas de **Autenticación, Usuarios y Perfiles**, interfaz de **Partidas, Sesiones y Misiones**, accesibilidad WCAG 2.0 A/AA y suite E2E con Playwright.
  5. **Octavio Gudiño (Frontend):** Contratos TypeScript (`interfaces.ts`), servicios cliente de dominio, manejo asíncrono en páginas y componentes de **Personajes**, **Clases**, **Tiendas**, **Objetos**, formularios interactivos de **Compra y Venta** (`PurchaseItemForm`, `SaleItemForm`), **Gestor de Inventarios** (`ModulePage.tsx`) y pruebas unitarias de interfaz.

### Decisiones

- Queda cerrado el código de producción con el 100 % de las suites unitarias, de integración y E2E en verde tras el refactor de nomenclatura (PR #80).
- La defensa oral seguirá la división acordada (3 bloques de Backend: Alejandro, Emanuel y Testi; 2 bloques de Frontend: Renzo y Octavio) acompañando la explicación técnica con la demostración en vivo sobre el entorno desplegado.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Unificar y auditar la trazabilidad final entre `trackeo.md`, `minutas.md` y `seguimiento.md` | Todo el equipo | 2026-10-17 |
| Repasar el guion oral y verificar cuentas de demostración (`dm_demo` y `jugador_demo`) antes de la defensa | Alejandro Ciesco, Emanuel Salomón, Franco Testi, Renzo Scollo y Octavio Gudiño | Día de la defensa |

### Pendientes de la reunión anterior

- Verificación manual sobre la URL desplegada en Render y grabación del video de demostración: completadas.

## 2026-10-14 — Cierre de economía de juego, validación de compras por nivel y despliegue a producción (Render + Supabase)

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión sincrónica de coordinación, revisión conjunta de código y verificación de despliegue.

### Temas tratados

- **Economía de juego y compra de objetos no únicos (PR #72, PR #73 y PR #76):** Se implementó en backend (`item.service.ts`) la regla de negocio para permitir la compra continua e ilimitada de objetos comunes/consumibles (clonando una nueva instancia en el inventario del comprador mientras la plantilla permanece en la tienda) y se adaptaron en frontend (`ShopsPage.tsx`, `ItemsPage.tsx`, `PurchaseItemForm.tsx`) los formularios y listados para evitar duplicados visuales (Franco Testi en Backend y Octavio Gudiño en Frontend).
- **Validación estricta de nivel en compras:** Se acordó bloquear la adquisición de objetos cuyo requisito de nivel sea superior al nivel actual del personaje. Se implementó una doble validación: en el frontend (`ShopsPage` / `PurchaseItemForm`, botón deshabilitado con aviso explicativo) y en el backend (`item.service.ts`, retorno de código HTTP 400 con `NivelInsuficienteError`), sumando casos de prueba en `src/tests/item.purchase.test.ts` y `src/integration/game.test.ts` (Franco Testi en Backend y Octavio Gudiño en Frontend).
- **Optimización visual y catálogo limpio de tienda:** Se depuró la vista del catálogo de tiendas en el frontend para agrupar ítems por definición y rediseñar las tarjetas de productos y el detalle expandido en el inventario (`ModulePage.tsx` y `ShopsPage.tsx`, Octavio Gudiño).
- **Configuración integral de despliegue en la nube (PR #74):** Se estandarizó el script `npm run build:all` para compilar de manera unificada backend y frontend, se ajustó `tsconfig.json`, se incorporó `@types/pg` en dependencias de producción y se habilitó el endpoint `/partidas/activas` en el backend para comprobación de partidas en curso (Franco Testi).
- **Verificación en vivo en Render y Supabase:** El equipo verificó el despliegue exitoso del servicio web en la plataforma Render bajo una arquitectura Same-Origin (el backend Express sirve tanto la API `/api` como los estáticos de React compilados), conectado mediante SSL seguro al Session Pooler de PostgreSQL en Supabase (Franco Testi y Emanuel Salomón).
- **Actualización de documentación para la cátedra (PR #75):** Se completaron y sincronizaron colaborativamente los documentos `docs/despliegue.md`, `docs/demo.md`, `docs/entrega.md` y `docs/minutas.md`, registrando la URL pública activa del despliegue y las credenciales de demo para los roles de Anfitrión y Jugador (Emanuel Salomón y Franco Testi).

### Decisiones

- Los objetos no únicos admiten compra infinita mediante clonación de instancia; los objetos únicos se reservan exclusivamente para una sola compra por partida y se transfieren físicamente.
- La restricción de nivel para compra de ítems es obligatoria y se valida de forma estricta tanto en cliente como en servidor.
- La aplicación queda formalmente publicada y operativa en la nube para la evaluación docente.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Ajustes finales de UI móvil, filtros de inventario por personaje y refactor de nomenclatura | Renzo Scollo y Octavio Gudiño (Frontend); Alejandro Ciesco, Emanuel Salomón y Franco Testi (Backend) | 2026-10-16 |
| Auditoría final de la documentación de entrega, video de demo y credenciales | Emanuel Salomón y Franco Testi | 2026-10-16 |

### Pendientes de la reunión anterior

- Despliegue en la nube y configuración de variables de entorno de producción: resuelto satisfactoriamente.

## 2026-10-13 — Estabilización de calidad, resolución de linter y optimización de tienda del anfitrión

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de revisión de código (code review) y coordinación técnica.

### Temas tratados

- **Resolución integral de advertencias de linter (PR #70):** Se abordaron todas las advertencias reportadas por `oxlint` en el frontend, depurando variables sin uso, unificando tipados estrictos y asegurando un build limpio y sin advertencias en los pipelines de integración continua (Renzo Scollo y Octavio Gudiño).
- **Aislamiento de bases de datos para pruebas (PR #70):** Se consolidó el soporte para la variable `TEST_DB_URL`, permitiendo que las pruebas de integración backend de MikroORM corran contra un esquema temporal aislado, desacoplándolas de la base de datos de desarrollo y producción (Franco Testi y Emanuel Salomón).
- **Optimización de la tienda del Anfitrión (PR #71):** Se actualizó el servicio `shop.service.ts` en backend y la interfaz `ShopsPage.tsx` en frontend con los que el usuario anfitrión administra el catálogo y precios de su partida (Alejandro Ciesco en Backend y Octavio Gudiño en Frontend).

### Decisiones

- Todo pull request debe superar el linter (`npm run lint`) con cero advertencias antes de ser integrado a `main`.
- La suite de pruebas de integración debe ser totalmente reproducible y autónoma mediante la variable `TEST_DB_URL`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Implementar las reglas de compra infinita para objetos no únicos y validación de nivel requerido | Franco Testi (Backend) y Octavio Gudiño (Frontend) | 2026-10-14 |
| Preparar scripts de compilación (`build:all`) y configurar el despliegue en Render | Franco Testi y Emanuel Salomón | 2026-10-14 |

### Pendientes de la reunión anterior

- Centralización de avisos y notificaciones en modales accesibles: completado con la implementación de `NoticeModal` (originalmente `AvisoModal`).

## 2026-10-12 — Refactor visual e iconografía SVG, sistema de alertas en español y robustez E2E

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de diseño, accesibilidad y coordinación de pruebas automatizadas.

### Temas tratados

- **Estandarización de interfaz con iconografía SVG (PR #68 y PR #69):** Se aplicó el reemplazo sistemático de emojis por iconos vectoriales SVG limpios y consistentes en `components/ui/Icons.tsx` y en todas las vistas del frontend (Renzo Scollo y Octavio Gudiño).
- **Sistema unificado de notificaciones (`NoticeModal` / `AvisoModal`):** Se implementó un componente modal centralizado en `components/ui/NoticeModal.tsx` para presentar confirmaciones, avisos y errores en español neutro, erradicando alertas estándar del navegador (Renzo Scollo).
- **Contexto de juego en personajes:** Se enriqueció el DTO de `PersonajeService` en backend (`character.service.ts`) y las tarjetas de `CharacterList.tsx` / `CharactersPage.tsx` en frontend mostrando la partida asociada a cada personaje (Alejandro Ciesco en Backend y Octavio Gudiño en Frontend).
- **Accesibilidad y calibración visual de temas:** Se afinaron los acentos y contrastes en modo claro y modo oscuro para garantizar el cumplimiento de los estándares WCAG 2 AA, y se rediseñó la visualización de estadísticas de los personajes (Renzo Scollo y Octavio Gudiño).
- **Robustez de pruebas E2E en Playwright:** Se ajustaron selectores semánticos (`aria-label="XP:"`, etiquetas de recompensas) para evitar fragilidades en las pruebas automatizadas de reparto de premios y misiones, garantizando ejecuciones confiables en el CI (Renzo Scollo).

### Decisiones

- Queda prohibido el uso de emojis en los componentes de interfaz; toda la iconografía debe emplear componentes SVG.
- Las notificaciones y alertas al usuario deben canalizarse exclusivamente a través del componente modal unificado (`NoticeModal`).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Limpieza de advertencias de linter (`oxlint`) en el frontend y soporte de `TEST_DB_URL` | Renzo Scollo y Franco Testi | 2026-10-13 |
| Refinar la gestión y actualización de la tienda del anfitrión (`shop.service.ts` y `ShopsPage.tsx`) | Alejandro Ciesco y Octavio Gudiño | 2026-10-13 |

### Pendientes de la reunión anterior

- Segregación estricta de navegación según rol: resuelta e integrada en PR #67.

## 2026-10-09 — Implementación integral de roles (Jugador/Anfitrión), misiones y tiendas por partida y unificación de interfaz

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de integración, resolución de conflictos de ramas y planificación de requerimientos de negocio.

### Temas tratados

- **Resolución colaborativa de ramas de interfaz (PR #65 y PR #66):** El equipo integró las propuestas visuales desarrolladas en el frontend, preservando la paleta personalizada de botones, la barra superior flotante con autocierre de menús desplegables y corrigiendo selectores de opciones en Playwright para evitar timeouts en el CI (Renzo Scollo y Octavio Gudiño).
- **Implementación integral de reglas de roles y partidas (PR #67):**
  - **Diferenciación estricta de roles:** Se implementó en backend (`authorization.ts`) y en frontend (`MainLayout.tsx`, `UserContext.tsx`) la segregación de accesos entre el rol de Jugador y el rol de Anfitrión (Emanuel Salomón en Backend y Renzo Scollo en Frontend).
  - **Tiendas y misiones contextuales por partida:** Se acopló en backend la creación y gestión de tiendas (`shop.service.ts`) y misiones (`game.service.ts`) a cada partida particular, y se adaptaron sus pantallas en frontend (Alejandro Ciesco y Franco Testi en Backend; Octavio Gudiño y Renzo Scollo en Frontend).
  - **Objetos únicos y venta instantánea:** Se incorporó en `item.service.ts` y `game.service.ts` la regla de no reaparición de objetos únicos en tiendas tras ser comprados y la venta inmediata de ítems, junto con sus formularios en `components/objetos/` (Franco Testi en Backend y Octavio Gudiño en Frontend).
  - **Accesibilidad y diseño responsivo:** Se mejoró la accesibilidad en controles `<select>`, campos numéricos de precio en inventarios y la adaptabilidad fluida en resoluciones móviles (Renzo Scollo y Octavio Gudiño).

### Decisiones

- La navegación y permisos de la aplicación quedan estrictamente supeditados al rol activo del usuario en la partida.
- El catálogo de tiendas y el registro de misiones pertenecen al ámbito de cada partida específica y no tienen alcance global.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Reemplazar emojis por componentes SVG vectoriales y mostrar partida en tarjetas de personaje | Alejandro Ciesco (Backend), Renzo Scollo y Octavio Gudiño (Frontend) | 2026-10-12 |
| Unificar cuadros de diálogo y avisos del sistema en español (`NoticeModal`) y ajustar selectores E2E | Renzo Scollo | 2026-10-12 |

### Pendientes de la reunión anterior

- Pruebas unitarias de layout y verificación de contraste: completadas con éxito.

## 2026-10-08 (Tarde) — Formalización metodológica ágil, soporte multi-tema (claro/oscuro) y diseño Bento Grid

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Taller metodológico, sesión de diseño visual y revisión de integración continua.

### Temas tratados

- **Documentación de metodología y seguimiento del equipo (PR #59, PR #60 y PR #61):** Se redactaron y formalizaron en `docs/metodologia.md`, `docs/trackeo.md` y `docs/seguimiento.md` los lineamientos de trabajo bajo Scrum y Kanban, la trazabilidad de requerimientos y el enlace directo al tablero oficial de GitHub Projects (Franco Testi y Emanuel Salomón).
- **Soporte dinámico de temas claro y oscuro (PR #63):** Se diseñó e implementó la arquitectura de temas mediante `ThemeContext` y el componente interactivo `ThemeToggle`, acompañada por una suite completa de pruebas unitarias que superó los umbrales de cobertura exigidos (Renzo Scollo).
- **Auditoría de accesibilidad WCAG 2 AA:** Se revisaron y ajustaron los tokens de color para garantizar ratios de contraste conformes a las pautas WCAG 2 AA en ambos temas, y se eliminó el anidamiento interactivo no permitido en las tarjetas de personajes y clases (Renzo Scollo y Octavio Gudiño).
- **Evolución visual Bento Grid (PR #64):** Se adoptó una estética moderna basada en cuadrícula *Bento Grid*, incorporando la tipografía *Plus Jakarta Sans*, barra de navegación flotante con efecto *glassmorphism*, personalización de color de botones y autocierre de menús desplegables (Renzo Scollo y Octavio Gudiño).
- **Pruebas unitarias de layout y componentes clave:** Se agregaron pruebas para `DashboardPage`, `MainLayout` y páginas de dominio, asegurando que la cobertura de funciones del frontend supere el 36 % exigido por las políticas de calidad (Renzo Scollo y Octavio Gudiño).

### Decisiones

- Se establece el diseño Bento Grid y el soporte nativo de tema claro/oscuro como estándar visual definitivo de la aplicación.
- El avance y seguimiento de tareas se sincroniza activamente a través del tablero de GitHub Projects y la documentación en `docs/`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Coordinar la integración de ramas de diseño y avanzar en la segregación de roles por partida | Emanuel Salomón, Alejandro Ciesco y Franco Testi (Backend); Renzo Scollo y Octavio Gudiño (Frontend) | 2026-10-09 |
| Reforzar la suite de pruebas E2E ante los nuevos cambios visuales | Renzo Scollo | 2026-10-09 |

### Pendientes de la reunión anterior

- Puesta al día de todos los integrantes con la base de datos de Supabase: completada.

## 2026-10-08 (Mañana) — Puesta al día de la migración a PostgreSQL y estabilización de interfaz

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión sincrónica de sincronización técnica y distribución de tareas.

### Temas tratados

- **Sincronización de entornos de desarrollo locales:** Cada integrante actualizó su copia local mediante `git pull` sobre `main`, ejecutó `npm ci`, completó su archivo `.env` con la cadena de conexión de Supabase y verificó el acceso con `npm run db:probar`.
- **Gestión centralizada de accesos a la base de datos:** Se coordinó la provisión de accesos para todos los miembros del equipo al panel de administración de Supabase (Emanuel Salomón).
- **Estabilización de mejoras visuales del frontend (PR #58):** Se trabajó sobre la rama `feat/frontend-mejoras-visuales` para reintegrar componentes clave de interfaz (barra superior con menús desplegables, formularios, avatares y visor de imágenes), corrigiendo el orden de hooks en `UserDetail` y el desborde responsivo a 375 px para asegurar que pasen todos los checks del CI (Renzo Scollo y Octavio Gudiño).
- **Centralización y consolidación de minutas:** Se recopilaron y unificaron en el canal común las minutas de reuniones y acuerdos técnicos previos para consolidar el registro histórico de seguimiento del proyecto.

### Decisiones

- La nueva interfaz se integra de forma permanente en `main` tras verificar que pasan satisfactoriamente lint, build, pruebas unitarias y E2E.
- Se adopta la barra superior flotante organizada en cuatro menús contextuales: Juego, Personajes, Catálogo y Sistema.
- **Seguridad y confidencialidad:** Se acordó rotar contraseñas de la base de datos y evitar compartir credenciales o secretos por canales abiertos de chat, manteniéndolas en variables de entorno locales.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Rotar contraseñas de la base de datos de Supabase y actualizar secretos | Emanuel Salomón | Antes de la entrega |
| Formalizar y documentar el marco metodológico (`metodologia.md`, `trackeo.md`, `seguimiento.md`) | Franco Testi y Emanuel Salomón | 2026-10-08 (Tarde) |
| Desarrollar el soporte de tema oscuro y claro con pruebas unitarias | Renzo Scollo | 2026-10-08 (Tarde) |

### Pendientes de la reunión anterior

- Evaluación de la latencia y rendimiento de las consultas hacia Supabase: se mantiene bajo monitoreo.

## 2026-10-07 — Migración de persistencia a PostgreSQL (Supabase) y estrategia de integración continua

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión técnica de evaluación arquitectónica y resolución de contingencias.

### Temas tratados

- **Debate técnico sobre infraestructura de persistencia:** El equipo evaluó la transición técnica de MySQL (`@mikro-orm/mysql`) hacia PostgreSQL en Supabase, sopesando alternativas en la nube (Aiven, Railway, Render, Vercel, Netlify). Se consensuó avanzar de manera definitiva con Supabase y PostgreSQL para contar con una base de datos administrada y accesible para todo el equipo sin depender de servidores locales.
- **Ejecución coordinada de la migración y bloqueos pesimistas (PR #54):** Se adaptó el backend a PostgreSQL utilizando `@mikro-orm/postgresql` en `mikro-orm.config.ts`, implementando la consulta paralela de usuarios y roles en `auth.ts`, resolviendo la incompatibilidad de `SELECT ... FOR UPDATE` en `LEFT JOIN` mediante `strategy: 'select-in'` en `item.service.ts` y `game.service.ts` para las compras y ventas concurrentes, configurando pruebas de integración sobre esquemas temporales aislados e incorporando los scripts `db:rls` y `db:probar` junto con la defensa CSRF en `app.ts` (Alejandro Ciesco, Emanuel Salomón y Franco Testi).
- **Guía de actualización para el equipo:** Se elaboró y publicó `TUTORIAL.md` en la raíz del repositorio detallando los pasos para que todos los integrantes configuren sus entornos locales con Supabase (PR #57, Emanuel Salomón).
- **Control de estabilidad en CI (PR #52 y PR #55):** Ante fallas de lint y E2E provocadas por desajustes visuales, se resolvió revertir de forma preventiva las modificaciones de interfaz para preservar la estabilidad de `main`, conservándolas en una rama de trabajo para resolver las inconsistencias (Renzo Scollo y Octavio Gudiño).
- **Preparación de datos de prueba y diseño de perfiles:** Se coordinó la carga estandarizada de datos de demostración mediante `npm run demo:datos`, y se consensuó usar la letra inicial en avatares de reemplazo para evitar desbordes visuales.
- **Monitoreo y aprobación de ajustes de CI:** Se revisaron y aprobaron PRs de corrección en flujos de integración continua (#51, #53, #56, Emanuel Salomón en Backend y Renzo Scollo en Frontend).

### Decisiones

- Supabase (PostgreSQL) se establece como la base de datos compartida y oficial del proyecto.
- Se prioriza la estabilización del pipeline de CI: ningún cambio de frontend puede ingresar a `main` sin tener los tres checks (lint, build y tests) en verde.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Sincronizar copias locales (`git pull`, `npm ci`, `.env` y `npm run db:probar`) | Todo el equipo | 2026-10-08 |
| Estabilizar y corregir inconsistencias en la rama de mejoras visuales (PR #58) | Renzo Scollo y Octavio Gudiño | 2026-10-08 |

### Pendientes de la reunión anterior

- Verificaciones de módulos de fin de septiembre (PR #41 a #48): completadas e integradas en `main`.

## 2026-09-22 — Ensayo general, auditoría de calidad y coordinación de la presentación del proyecto

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Ensayo sincrónico, revisión de pruebas de cierre y calibración de exposición grupal.

### Temas tratados

- **Revisión de calidad visual, responsive y accesibilidad (PR #38):** Se revisaron los resultados de los recorridos responsivos en 375, 768 y 1280 px y la auditoría WCAG 2.0 A/AA con `axe-core`, junto con las mejoras de las pantallas de comercio e inventarios (PR #36 de Octavio Gudiño) y del motor de partidas, sesiones y misiones (PR #37 de Franco Testi).
- **Ensayo general y cronometrado grupal:** El equipo realizó un ensayo completo de la presentación evaluando los tiempos de exposición por bloque (promediando entre 4 y 5 minutos por integrante), asegurando que la duración total se encuadre en el límite estipulado por la cátedra.
- **Revisión de temas y complementariedad:** Se repasó la articulación entre los cinco ejes asignados (Alejandro Ciesco en modelo ORM/SQL y backend de clases, tiendas y personajes; Emanuel Salomón en `app.ts`, seguridad, `scrypt` y backend de usuarios y perfiles; Franco Testi en motor backend transaccional de partidas, sesiones, misiones, inventarios y comercio con bloqueos pesimistas; Renzo Scollo en arquitectura React SPA, contextos, UI, cuentas, sesiones/misiones y E2E/CI; Octavio Gudiño en interfaces TypeScript y frontend de personajes, clases, tiendas, objetos, compra/venta e inventarios).
- **Planificación de la demostración práctica en vivo:** Se acordó que la demostración del sistema en funcionamiento se realice de punta a punta desde la interfaz del frontend con dos sesiones simultáneas (Anfitrión y Jugador).

### Decisiones

- Mantener los tiempos de exposición calibrados en el ensayo para garantizar una presentación equilibrada.
- Completar durante la semana las evidencias documentales de pruebas, concurrencia, `api.md` e instalación limpia (que luego se integraron en los PR #40 a #48).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Revisar `api.md`, validar error 413 (> 64 KB) en `app.ts` y consolidar script `demo:datos` | Emanuel Salomón | 2026-09-24 |
| Documentar evidencia de pruebas, cobertura e inspección responsive (PR #40, #47, #48) | Renzo Scollo | 2026-09-29 |
| Documentar verificación de concurrencia en `game.test.ts` y checklist de tiendas/inventarios (PR #41, #43) | Franco Testi y Octavio Gudiño | 2026-09-26 |
| Actualizar `api.md` con rutas de sesiones, misiones e inventarios (PR #44, #45) | Franco Testi | 2026-09-26 |
| Documentar verificación de modelo ORM, clases, tiendas y personajes (PR #46) | Alejandro Ciesco | 2026-09-29 |

### Pendientes de la reunión anterior

- Integración de todos los módulos del alcance de aprobación y suite E2E en CI: completada entre el 14/09 y el 21/09.

## 2026-09-09 — Integración de autenticación, sesiones, misiones, personajes, comercio transaccional y suite E2E

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de integración de módulos principales y cierre funcional.

### Temas tratados

- **Rutas, cuentas, perfiles y seguridad (PR #23, PR #24 y PR #26):** Se dividió el frontend en páginas y rutas protegidas (Renzo Scollo), se estandarizaron las validaciones de usuario, jugador y anfitrión en backend y se integró la autenticación con contraseñas hasheadas (`scrypt` + `timingSafeEqual`), cookies `HttpOnly`/`SameSite=Strict` y autorización por rol en el servidor (Emanuel Salomón en Backend y Renzo Scollo en Frontend).
- **Clases, tiendas y creación de personajes (PR #28):** Se integraron en backend los módulos de clases (`class.*`), tiendas (`shop.*`) y personajes (`character.*`), garantizando la inicialización de estadísticas base (nivel 1, 0 XP, 100 de oro) y la creación del inventario principal #1 con capacidad de 10 casillas, junto con sus vistas en el frontend (Alejandro Ciesco en Backend y Octavio Gudiño en Frontend).
- **Comercio transaccional, inventarios, compra y venta (PR #25, PR #29 y PR #31):** Se implementaron en backend (`item.service.ts`, `game.service.ts`) las operaciones transaccionales de compra con bloqueo pesimista, movimiento de objetos entre inventarios y venta dentro del rango permitido del 70 % al 100 %, y en frontend (`ShopsPage`, `ItemsPage`, `PurchaseItemForm`, `SaleItemForm`, `ModulePage`) sus componentes interactivos (Franco Testi en Backend y Octavio Gudiño en Frontend).
- **Sesiones, participantes, misiones y calificación del anfitrión (PR #27, PR #30 y PR #32):** Se integró en backend (`game.service.ts`) el ciclo completo de sesiones (`planificada` → `en curso` → `finalizada`), el registro de participantes, la distribución transaccional de recompensas al completar misiones y el voto único de karma al anfitrión, junto con `SessionsPage.tsx` y `MissionsPage.tsx` en el frontend (Franco Testi en Backend y Renzo Scollo en Frontend).

### Decisiones

- Incorporar una suite de pruebas E2E automatizadas con Playwright y un pipeline de integración continua en GitHub Actions para blindar `main` ante regresiones de compilación o de flujo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar el flujo transaccional de partidas, sesiones y misiones en backend (`game.service.ts`) | Franco Testi | 2026-09-11 |
| Implementar `SessionsPage`, `MissionsPage`, `NotFoundPage`, suite E2E con Playwright y workflow de GitHub Actions (PR #32, #33, #34) | Renzo Scollo | 2026-09-14 |
| Completar servicios y seguridad de cuentas y perfiles en backend (commits 15/09) | Emanuel Salomón | 2026-09-15 |
| Ampliar pruebas unitarias de clases, tiendas y personajes en backend (PR #35) | Alejandro Ciesco | 2026-09-16 |
| Refinar componentes y pantallas de tiendas, objetos e inventarios en frontend (PR #36) | Octavio Gudiño | 2026-09-18 |

### Pendientes de la reunión anterior

- Desarrollo de los cinco módulos de dominio en backend y frontend: completado.

## 2026-08-24 — Implementación de módulos del dominio, validaciones Zod y primeros componentes de frontend

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de sincronización de desarrollo por módulo.

### Temas tratados

- **Validaciones con esquemas Zod, repositorio de usuarios y servidor Express (PR #18):** Se incorporó la validación de entrada con Zod (`user.schema.ts`), la capa `user.repository.ts` y la configuración de CORS y errores en `app.ts` (Emanuel Salomón).
- **Módulos de jugador, anfitrión y partida:** Se desarrollaron los servicios, validadores y controladores backend para la administración de jugadores y anfitriones (Emanuel Salomón) y de partidas (Franco Testi).
- **Módulos de clases, tiendas y caso de uso Crear Personaje (PR #19):** Se implementaron los DTOs, validadores, servicios y controladores de clases (`class.*`), tiendas (`shop.*`) y personajes (`character.*`) en el backend (Alejandro Ciesco).
- **Tipado estricto de interfaces y frontend de dominio (PR #21 y PR #22):** Se estandarizó `frontend/src/interfaces.ts` eliminando usos de `any` y se estructuraron los componentes de objetos, tiendas, clases y personajes en el frontend (Octavio Gudiño), junto con el layout general y páginas de usuarios (Renzo Scollo).

### Decisiones

- Estandarizar el uso de DTOs y validadores en todos los endpoints antes de pasar a la integración de los casos de uso complejos (compra/venta, sesiones y misiones).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Dividir el frontend en páginas con React Router (`App.tsx`, `MainLayout`) y refactorizar `UsersPage` (PR #23) | Renzo Scollo | 2026-09-01 |
| Reforzar validaciones de usuario, jugador y anfitrión y desarrollar `auth.ts` y `authorization.ts` (PR #24, #26) | Emanuel Salomón | 2026-09-07 |
| Desarrollar pantallas y formularios de objetos, tiendas, compra, venta e inventarios en frontend (PR #25, #29, #31) | Octavio Gudiño | 2026-09-07 |
| Desarrollar el motor backend de partidas, sesiones, misiones, inventarios y compra/venta transaccional (PR #25, #27, #31, #32) | Franco Testi | 2026-09-07 |
| Completar los módulos backend de clases, tiendas y personajes con sus pruebas unitarias (PR #28) | Alejandro Ciesco | 2026-09-07 |

### Pendientes de la reunión anterior

- CRUD de usuarios integrado con la API (PR #17): completado el 13/08.

## 2026-08-12 — Presentación de la prueba de concepto, configuración de base de datos y planificación de pruebas

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión técnica y organizativa.

### Temas tratados

- **Configuración de MikroORM y estabilización del backend (PR #13, PR #14 y PR #15):** Se documentó la configuración de `mikro-orm.config.ts` y las entidades (Alejandro Ciesco) y se restauraron los archivos del servidor Node.js que se habían retirado por error en un merge previo (Franco Testi).
- **Integración del CRUD de usuarios con la API (PR #17):** Se revisó la conexión de punta a punta del módulo de usuarios entre React (`UsersPage`, `user.service.ts`) y Express/MikroORM (`user.controller.ts`, `user.service.ts`) (Emanuel Salomón en Backend y Renzo Scollo en Frontend).
- **Definición de estrategia de pruebas E2E:** El equipo evaluó e incorporó Playwright dentro de la hoja de ruta de calidad para las pruebas de extremo a extremo (cuya integración completa en CI quedó programada para septiembre una vez cerrados los flujos de negocio).
- **Distribución equitativa de temas de exposición:** Se acordó el reparto balanceado de los temas de la prueba de concepto para la presentación grupal, abarcando arquitectura en capas, ORM, seguridad, reglas de dominio y demostración de código.
- **Sincronización y revisión de pull requests:** El equipo acordó mantener limpio el árbol del repositorio y reforzar buenas prácticas para la publicación y sincronización de ramas de trabajo (`git push -u origin <rama>`).

### Decisiones

- Todo desarrollo nuevo debe integrarse mediante pull request con revisión compartida.
- Avanzar sobre el molde del CRUD de usuarios (PR #17) para construir el resto de las entidades y validaciones.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Finalizar e integrar el CRUD de usuarios entre backend y frontend (PR #17, #18) | Emanuel Salomón y Renzo Scollo | 2026-08-16 |
| Desarrollar los CRUD backend de clases, tiendas y personajes con DTOs y validadores (PR #19) | Alejandro Ciesco | 2026-08-24 |
| Desarrollar el módulo backend de partidas, sesiones y objetos | Franco Testi | 2026-08-24 |
| Estandarizar `frontend/src/interfaces.ts` eliminando `any` y armar vistas de catálogo (PR #21, #22) | Octavio Gudiño | 2026-08-24 |

### Pendientes de la reunión anterior

- Consolidación de diapositivas en Google Slides: completada.

## 2026-08-08 — Planificación y armado colaborativo de la presentación

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión colaborativa de planificación y diseño de contenidos.

### Temas tratados

- **Revisión de temas y referencias de la cátedra:** El equipo analizó en detalle la matriz de temas requeridos y el repositorio de referencia de la prueba de concepto de la cátedra (`utnfrrodsw/poc`).
- **Coautoría de diapositivas en la nube:** Se acordó estructurar la presentación en Google Slides para facilitar el trabajo simultáneo y la coautoría en tiempo real de todos los integrantes.
- **Repositorio compartido de recursos:** Se organizó una carpeta compartida en Drive para centralizar capturas, diagramas, esquemas y recursos gráficos del proyecto.

### Decisiones

- Utilizar Google Slides como herramienta colaborativa para el diseño y edición de la presentación del equipo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar los contenidos de las diapositivas de la presentación | Todo el equipo | 2026-08-12 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-07-31 — Estandarización del servidor Express y actualización del diagrama relacional

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de revisión arquitectónica y estandarización de scripts.

### Temas tratados

- **Actualización consensuada del modelo relacional:** El equipo oficializó la nueva versión del diagrama entidad-relación (`DER_NEW.png`), archivando de mutuo acuerdo la versión preliminar (`ModeloDominioOLD`).
- **Revisión colaborativa de controladores (PR #12):** Se validó la corrección en el controlador de usuarios (`user.controller.ts`), asegurando la conversión numérica estricta mediante `parseInt` y la validación adecuada de identificadores en rutas (Emanuel Salomón).
- **Estandarización del comando de inicio:** Se acordó y documentó el comando unificado `npm run dev` para levantar el entorno de desarrollo local de manera homogénea en todos los puestos de trabajo.

### Decisiones

- El nuevo diagrama entidad-relación (`DER_NEW.png`) constituye la referencia oficial del modelo de datos.
- Se adopta `npm run dev` como script estándar para desarrollo local.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar la configuración de entidades ORM (`mikro-orm.config.ts`) y expandir la API de usuarios (PR #13 y PR #17) | Alejandro Ciesco, Emanuel Salomón y Renzo Scollo | 2026-08-12 |

### Pendientes de la reunión anterior

- Servidor Express (PR #9) y alineación con directivas de la cátedra (PR #10): resueltos favorablemente.

## 2026-07-17 — Definición de arquitectura en capas, stack MikroORM y esquema de persistencia

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de diagnóstico técnico y diseño arquitectónico.

### Temas tratados

- **Diagnóstico del estado del proyecto:** El equipo analizó en conjunto la situación del prototipo inicial (el cual operaba con datos en memoria) y definió los requerimientos estructurales exigidos por la cátedra: API REST con Express en arquitectura en capas, persistencia profesional con MikroORM, configuración protegida mediante `.env`, autenticación en dos niveles (jugador y anfitrión) con protección de rutas y pruebas automatizadas.
- **Estrategia de desarrollo vertical testigo:** Se acordó implementar como molde arquitectónico completo el CRUD de Usuario de punta a punta: React → fetch → Express → Service → MikroORM → Base de datos, de modo que sirva como plantilla reproducible para las demás entidades.
- **Configuración de dependencias y paquetes (PR #5 y PR #6):** Se instalaron y configuraron colaborativamente `@mikro-orm/core@6`, `dotenv` y `tsx`, reestructurando el repositorio y depurando `SQL/rpg.sql` (Alejandro Ciesco, Renzo Scollo y Octavio Gudiño).
- **Definición de estructura y variables de entorno:** Se consensuó la distribución de paquetes en capas (`entities`, `services`, `controllers`, `routes`) y se definieron las variables requeridas en `.env`.
- **Creación de tablas y datos iniciales:** Se ejecutaron pruebas de creación de esquemas (`npm run schema:create`) y se cargaron de forma colaborativa las clases de D&D y los datos de prueba de usuarios y jugadores, consolidando el script integral `CREATE TABLE`.

### Decisiones

- Desarrollar la entidad Usuario de extremo a extremo como modelo testigo para las demás entidades.
- Implementar la persistencia mediante MikroORM protegiendo todas las credenciales mediante variables de entorno.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Definir las entidades del modelo relacional en `src/entities/` y configurar `mikro-orm.config.ts` (PR #7, #8, #11) | Alejandro Ciesco | 2026-07-27 |
| Implementar el servidor Express base (`src/app.ts`) y el controlador de usuarios (PR #9, #10, #12) | Emanuel Salomón | 2026-07-31 |

### Pendientes de la reunión anterior

- Sincronización del repositorio grupal en GitHub: cumplida.

## 2026-07-15 — Inicialización sincronizada del frontend y conexión a base de datos

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Taller práctico de puesta en marcha y homologación de entornos.

### Temas tratados

- **Puesta en marcha del frontend:** El equipo realizó la instalación sincronizada del frontend (`cd frontend`, `npm install`) y comprobó su correcto inicio local en los diferentes entornos de trabajo.
- **Verificación de conectividad a la base de datos:** Se efectuaron pruebas compartidas de conexión a MySQL a través del puerto 3306.
- **Homologación de entornos:** Se compartieron capturas de las pantallas locales para asegurar consistencia visual y funcional en las máquinas de todos los integrantes.
- **Reestructuración del repositorio:** Se consensuó la reorganización estructural del repositorio unificando frontend y backend bajo un modelo integrado.

### Decisiones

- Todo el equipo centraliza su desarrollo y control de versiones sobre el repositorio oficial compartido.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Verificar que el frontend levante sin errores en cada equipo | Todo el equipo | 2026-07-17 |

### Pendientes de la reunión anterior

- Consolidación del repositorio en GitHub: cumplida el 13/07.

## 2026-07-13 — Definición colaborativa de interfaces TypeScript y normalización de datos

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión técnica de modelado de software y normalización de tipos.

### Temas tratados

- **Modelado de interfaces TypeScript:** El equipo definió de manera colaborativa el archivo `frontend/src/interfaces.ts` conteniendo las 12 interfaces del esquema relacional, estandarizando el tratamiento de claves foráneas como identificadores numéricos y contemplando la nulabilidad según las reglas de negocio (Octavio Gudiño y Renzo Scollo).
- **Normalización de nomenclatura:** Se unificó transversalmente la propiedad `contrasena` (sin caracteres especiales) para garantizar interoperabilidad sin fricciones entre base de datos, API y cliente.
- **Adaptación de datos de prueba (`mockData.ts`):** Se alinearon los mocks al nuevo contrato de interfaces, validando el esquema en el cual un usuario puede desempeñarse tanto en el rol de jugador como de anfitrión.
- **Depuración de prototipos anteriores:** Se acordó dar por superado el archivo preliminar de prototipo (`TP_DSW.ts`) y sincronizar el nuevo modelo en el repositorio del equipo.

### Decisiones

- Adoptar el modelo de datos con `Usuario` como entidad base común para `Jugador` y `Anfitrion`.
- Estandarizar la propiedad de clave de acceso bajo la nomenclatura `contrasena` en todo el proyecto.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Sincronizar e integrar el nuevo modelo de interfaces en `frontend/src/interfaces.ts` (PR #5) | Octavio Gudiño y Renzo Scollo | 2026-07-17 (completado) |

### Pendientes de la reunión anterior

- Definición del esquema relacional: completada el 10/07.

## 2026-07-10 — Consolidación del esquema relacional y adopción de stack tecnológico

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Mesa de diseño de persistencia y consenso de arquitectura.

### Temas tratados

- **Diseño del esquema de base de datos:** El equipo estructuró y consensuó el esquema relacional en `SQL/rpg.sql` con sus claves primarias y foráneas para las 12 entidades del dominio: Usuario, Jugador, Anfitrion, Partida, Sesion, Mision, Clase, Tienda, Personaje, Inventario, Personaje_Sesion y Objeto (Alejandro Ciesco).
- **Elección del stack de persistencia:** Tras analizar diversas alternativas técnicas, se acordó por unanimidad la adopción de MySQL junto con MikroORM como tecnología de mapeo objeto-relacional (ORM).
- **Conectividad inicial a base de datos (PR #2):** Se estructuró el archivo `db.ts`, se incorporó `mysql2` y se llevaron a cabo pruebas conjuntas de acceso a una instancia compartida de base de datos para validar la conectividad grupal (Emanuel Salomón).

### Decisiones

- Se define el stack tecnológico de persistencia inicial: MySQL + MikroORM.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Definir las interfaces TypeScript del esquema relacional en `frontend/src/interfaces.ts` | Octavio Gudiño y Renzo Scollo | 2026-07-13 |
| Implementar módulos de conexión `db.ts` y primeras consultas (PR #2) | Emanuel Salomón | 2026-07-10 (completado) |

### Pendientes de la reunión anterior

- Cierre de la propuesta formal en `proposal.md`: completado el 08/07.

## 2026-07-08 — Consolidación final de la propuesta de proyecto

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de revisión y cierre de documentación formal.

### Temas tratados

- **Revisión exhaustiva de la propuesta (`proposal.md`):** El equipo revisó y validó en conjunto los objetivos del sistema, la lista de integrantes y los requerimientos funcionales documentados en `proposal.md`.
- **Verificación de criterios de entrega:** Se cotejó el documento contra la pauta de entrega de la cátedra para asegurar el cumplimiento integral de los ítems evaluados.

### Decisiones

- Se aprueba formalmente el documento `proposal.md` como versión definitiva del proyecto del equipo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Elaborar el esquema relacional de las 12 entidades (`SQL/rpg.sql`) | Alejandro Ciesco y todo el equipo | 2026-07-10 |

### Pendientes de la reunión anterior

- Revisión de la documentación compartida: completada.

## 2026-07-06 — Coordinación de arquitectura, clases del dominio y cronograma de trabajo

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión general de reinicio de actividades y planificación.

### Temas tratados

- **Revisión del modelo de dominio:** El equipo retomó el análisis del diagrama conceptual (`ModeloDominio.drawio.png`) y los documentos compartidos en Drive.
- **Análisis de la lógica de clases:** Se examinó de manera colaborativa el módulo preliminar de lógica del juego en JavaScript (`TP_DSW.js`), analizando su comportamiento funcional.
- **Estudio de arquitecturas de referencia:** Se revisaron repositorios de referencia recomendados por la cátedra para alinear la separación de responsabilidades y la modularización del código.
- **Planificación del cronograma grupal:** Se acordó un cronograma de reuniones periódicas y sincronización de tareas compatible con las cursadas y compromisos del equipo.

### Decisiones

- Continuar con el modelo de dominio conceptual acordado y avanzar en la estructuración de la propuesta formal.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Finalizar y cerrar el documento de propuesta `proposal.md` | Todo el equipo | 2026-07-08 |

### Pendientes de la reunión anterior

- Implementación inicial de métodos de lógica de clases: analizados para su posterior migración a la API.

## 2026-05-08 — Diseño de lógica de negocio y métodos de clases del dominio

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de trabajo colaborativo y definición de lógica de negocio.

### Temas tratados

- **Definición de métodos y responsabilidades por módulo:** En sesión conjunta se diseñó el catálogo de responsabilidades del sistema:
  - **Entidades, Clases, Tiendas y Personajes (Backend):** definición de clases de dominio, tiendas y alta de personajes con inventario inicial (Alejandro Ciesco).
  - **Usuarios, Jugadores, Anfitriones y Seguridad (Backend):** cuentas, doble perfil y autenticación (Emanuel Salomón).
  - **Partidas, Sesiones, Misiones, Inventarios y Comercio Transaccional (Backend):** avance de sesiones, misiones, karma y operaciones de compra/venta (Franco Testi).
  - **Arquitectura SPA, Componentes UI, Cuentas y Turnos (Frontend):** enrutamiento, contextos, modales/tablas y pantallas de sesiones y misiones (Renzo Scollo).
  - **Interfaces y Vistas de Personajes, Clases, Tiendas, Objetos e Inventarios (Frontend):** contratos de tipos y formularios de compra, venta e inventarios (Octavio Gudiño).
- **Desarrollo colaborativo de operaciones comerciales:** Se definieron las reglas de negocio de compra, venta (rango 70 %–100 %) y validación de nivel requerido.

### Decisiones

- La venta de un objeto acredita dinero al personaje según el factor de reventa y actualiza la disponibilidad según las reglas del objeto.
- Adquirir un objeto requiere obligatoriamente que el nivel del personaje sea igual o superior al nivel exigido por el objeto.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Integrar y depurar las primeras clases de entidades del juego en el repositorio (PR #1) | Alejandro Ciesco | 2026-05-15 |
| Desarrollar lógica backend de usuarios/perfiles y de partidas/sesiones/comercio | Emanuel Salomón y Franco Testi | 2026-05-15 |
| Estructurar interfaces y maquetado inicial de pantallas del frontend | Renzo Scollo y Octavio Gudiño | 2026-05-15 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-05-01 — Inicio del desarrollo en sesión Live Share y repositorio central

- **Participantes:** Franco Testi, Alejandro Ciesco, Renzo Scollo, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Primera sesión práctica mediante Live Share y programación en parejas / equipo.

### Temas tratados

- **Programación conjunta en tiempo real:** Se estableció una sesión de Live Share para codificar colaborativamente los primeros archivos de lógica del dominio del sistema.
- **Inicialización del repositorio oficial:** Se creó e inicializó el repositorio grupal oficial (`Gestor-de-turnos-para-partidas-de-juegos-de-Rol`), subiendo la base de código inicial en JavaScript.
- **Estandarización de canales de comunicación:** Se formalizaron los correos institucionales y canales de mensajería del equipo para mantener una comunicación fluida.

### Decisiones

- Se define el repositorio compartido como la única fuente de verdad y espacio oficial de desarrollo del equipo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Definir el listado detallado de métodos y reglas del dominio | Todo el equipo | 2026-05-08 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-04-17 — Refinamiento del alcance del sistema y revisión del modelo de dominio

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de refinamiento funcional y análisis de requerimientos.

### Temas tratados

- **Elaboración colaborativa de la propuesta:** El equipo avanzó de forma conjunta en la redacción de `proposal.md`, registrando los roles e identidades de GitHub de todos los miembros.
- **Revisión del modelo conceptual de dominio:** Se analizó de manera compartida el diagrama de dominio (`ModeloDominio.drawio.png`), respaldándose en material audiovisual explicativo.
- **Debate sobre entidades complementarias:** Se debatió la incorporación de entidades adicionales tales como **Reseña** del anfitrión, **Solicitud** de unión a partida, **Notificación** y **Mensaje** de chat dentro de la sesión. Tras el intercambio técnico, se acordó considerarlas como extensiones deseables pero no bloqueantes para la primera versión del sistema.

### Decisiones

- Se aprueba el contenido base de `proposal.md` para la propuesta del proyecto.
- Las entidades de reseñas, solicitudes y mensajería quedan registradas como extensiones opcionales, priorizando el núcleo central del juego.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Pulir y completar los detalles finales de `proposal.md` | Todo el equipo | 2026-07-08 |
| Verificar la vinculación de perfiles y usuarios en el documento | Todo el equipo | 2026-04-17 |

### Pendientes de la reunión anterior

- Matriz CRUD y consulta técnica con los docentes: realizada según lo previsto.

## 2026-04-10 — Elaboración de matriz CRUD y modelo conceptual de clases

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de trabajo sincrónico y asincrónico para el diseño conceptual.

### Temas tratados

- **Construcción de la matriz CRUD:** El equipo seleccionó colaborativamente las entidades sustantivas del sistema para confeccionar la matriz de operaciones CRUD requerida para la consulta con la cátedra.
- **Modelado conceptual en draw.io:** Se comenzó el diagrama de dominio en draw.io. Se debatió ampliamente si `tipoObjeto` debía modelarse como una clase independiente o como un atributo de `Objeto`, concluyendo consensuadamente que convenía mantenerlo como atributo al no requerir comportamiento ni atributos propios.
- **Cierre de la votación del proyecto:** Se formalizó el resultado de la encuesta interna de selección del tema, ratificando por consenso el desarrollo del Gestor de Partidas de Juegos de Rol.
- **Organización y reparto coordinado del trabajo:** El equipo distribuyó las responsabilidades iniciales asegurando un avance equilibrado entre todos los integrantes.

### Decisiones

- Modelar `tipoObjeto` como atributo dentro de la entidad `Objeto`.
- Adoptar formalmente el tema "Gestor de partidas de juegos de Rol" como proyecto definitivo de la materia.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Finalizar el diagrama del modelo de dominio en draw.io | Todo el equipo | 2026-04-17 |
| Alinear requerimientos y preparar el borrador de propuesta | Todo el equipo | 2026-04-17 |

### Pendientes de la reunión anterior

- Cierre de la votación del tema definitivo: concretado en esta reunión.

## 2026-04-03 — Kickoff inicial: evaluación de propuestas y elección consensuada del tema

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión inicial de conformación de equipo y deliberación de propuestas.

### Temas tratados

- **Evaluación de ideas de proyecto:** El equipo analizó y debatió diversas alternativas de proyectos para el año:
  - Sistema de asistencia institucional mediante códigos QR para la universidad.
  - Plataforma de compra y venta de pasajes y boletos.
  - Gestor de turnos y partidas para juegos de rol (TTRPG).
  - Plataforma de catálogo y compraventa de videojuegos.
  - Sistema de administración para un club social y deportivo.
  - Sistema de turnos para clubes o canchas de fútbol (propuesta estándar de la cátedra).
- **Análisis de directivas de la cátedra:** Se revisaron en conjunto los repositorios y lineamientos de `utnfrrodsw` para asegurar que la idea seleccionada satisfaga los requisitos de complejidad, modelo de datos y arquitectura en capas.
- **Fork del repositorio oficial:** Se realizó el fork del repositorio de la cátedra como base reglamentaria para el seguimiento de la materia.
- **Matriz preliminar de operaciones:** Se creó un documento compartido en Google Docs para volcar las operaciones CRUD de cada alternativa evaluada y facilitar la toma de decisiones.

### Decisiones

- Abrir una encuesta interna para la elección democrática del tema definitivo (con fecha de cierre el 10/04).
- Trabajar a partir del fork oficial del repositorio de la cátedra.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Estructurar la matriz de entidades y operaciones CRUD en el documento compartido | Todo el equipo | 2026-04-10 |
| Concluir la votación y definir el tema final | Todo el equipo | 2026-04-10 |

### Pendientes de la reunión anterior

- No existen reuniones anteriores (Kickoff inicial).
