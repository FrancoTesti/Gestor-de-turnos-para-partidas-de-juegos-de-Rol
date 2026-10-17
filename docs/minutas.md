# Minutas de reunión

> Registro de reuniones de seguimiento, acuerdos técnicos y coordinación del equipo de desarrollo.
> Refleja el trabajo colaborativo, las decisiones arquitectónicas consensuadas y la evolución del proyecto.

## Equipo de desarrollo

| Integrante | Rol en la defensa y áreas principales de desarrollo |
| --- | --- |
| Franco Testi | **Líder de Proyecto y Backend Core:** arquitectura Express (`RequestContext`), configuración MikroORM, modelo de dominio, ciclo de partidas, sesiones, misiones y calificación, diseño de interfaz y despliegue Same-Origin en Render |
| Octavio Alejandro Gudiño | **Motor de Economía y Persistencia Concurrente:** catálogos de tiendas, objetos únicos y comunes clonados, inventarios, transacciones atómicas de compra/venta, reglas de reventa y bloqueos pesimistas (`PESSIMISTIC_WRITE` con `select-in`) |
| Emanuel Salomón | **Seguridad, Cuentas y Criptografía:** autenticación con cookies `HttpOnly`/`SameSite=Strict`, hashing `scrypt` (`timingSafeEqual`), identidad polimórfica y autorización por rol, migración a PostgreSQL (Supabase), datos de demo y documentación de entrega |
| Alejandro Mario Ciesco | **Lógica de Personajes, Clases y Reglas de Negocio:** CRUD de clases, creación atómica de personaje e inventario base #1, control de acceso y cupos en partidas públicas/privadas, validaciones de nivel requerido y movimiento de objetos en inventario |
| Renzo Scollo | **Frontend SPA, Calidad, Testing y CI/CD:** arquitectura React SPA (`UserContext`, cliente HTTP `api.ts`), diseño responsive y multi-tema, accesibilidad WCAG 2.0 A/AA (`axe-core`), pirámide de pruebas (Vitest unitario/integración y Playwright E2E) e integración continua en GitHub Actions |

## Minutas

<!-- Agregar las minutas acá, la más reciente primero. -->

## 2026-10-16 — Estandarización de código al inglés, cierre de interfaz móvil y organización de la defensa oral

- **Participantes:** Franco Testi, Octavio Gudiño, Emanuel Salomón, Alejandro Ciesco, Renzo Scollo.
- **Modalidad:** Reunión sincrónica de cierre técnico y planificación de la exposición oral.

### Temas tratados

- **Mejoras finales de interfaz móvil, directorio e inventarios (PR #76, #77, #78 y #79):** Se integraron los ajustes finales de navegación móvil, paginación del directorio, acceso directo a inventarios filtrados por personaje (`CharactersPage`), indicadores visuales de objetos únicos ya adquiridos y optimización de modales y formularios de venta en resoluciones pequeñas (Franco Testi, Alejandro Ciesco y Renzo Scollo).
- **Estandarización de nombres de archivos y funciones al inglés (PR #80):** Se tradujeron los nombres de archivos y métodos internos del backend y frontend al inglés (`user.service.ts`, `game.service.ts`, `item.service.ts`, `character.service.ts`, `sale.rules.ts`, `src/integration/game.test.ts`, `ShopsPage.tsx`, `SessionsPage.tsx`, `MissionsPage.tsx`, `NoticeModal.tsx`), preservando intactos los contratos HTTP de la API, la base de datos y los textos de interfaz en español (Franco Testi y Renzo Scollo).
- **Publicación del video de demostración y actualización de guías (PR #75 y commits en `TUTORIAL.md`):** Se incorporó el enlace al video de demostración grabado en Google Drive dentro de `TUTORIAL.md` y se sincronizaron las minutas y guías de despliegue (Emanuel Salomón y Franco Testi).
- **Organización de la defensa oral y reparto de bloques:** El equipo definió la estructura de exposición y demostración en vivo (con dos navegadores en paralelo para Anfitrión y Jugador) dividida en cinco ejes técnicos alineados con los módulos desarrollados:
  1. **Franco Testi:** Arquitectura global en Express (`RequestContext`), configuración MikroORM, ciclo de vida de partidas, sesiones, misiones y despliegue Same-Origin en Render.
  2. **Octavio Gudiño:** Motor de economía, catálogos de tiendas, clonación de objetos comunes frente a transferencia de objetos únicos y bloqueos pesimistas (`LockMode.PESSIMISTIC_WRITE` con `strategy: 'select-in'`).
  3. **Emanuel Salomón:** Seguridad y criptografía (`scrypt` y `timingSafeEqual`), sesiones mediante cookies `HttpOnly`/`SameSite=Strict`/`Secure`, identidad polimórfica y autorización por rol en el servidor.
  4. **Alejandro Ciesco:** Creación atómica de personaje e inventario inicial #1 en una única transacción, clases, validaciones de nivel/cupos y organización de inventarios.
  5. **Renzo Scollo:** Arquitectura Frontend SPA en React (`UserContext` y cliente `api.ts`), diseño responsive y accesibilidad WCAG 2.0 A/AA (`@axe-core/playwright`), pirámide de testing automatizado (Vitest unitario/integración y Playwright E2E) y pipeline CI/CD en GitHub Actions.

### Decisiones

- Queda cerrado el código de producción con el 100 % de las suites unitarias, de integración y E2E en verde tras el refactor de nomenclatura (PR #80).
- La defensa oral seguirá el orden temático acordado (Franco → Octavio → Emanuel → Alejandro → Renzo) acompañando la explicación técnica con la demostración en vivo sobre el entorno desplegado.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Unificar y auditar la trazabilidad final entre `trackeo.md`, `minutas.md` y `seguimiento.md` | Todo el equipo | 2026-10-17 |
| Repasar el guion oral y verificar cuentas de demostración (`dm_demo` y `jugador_demo`) antes de la defensa | Franco Testi, Octavio Gudiño, Emanuel Salomón, Alejandro Ciesco y Renzo Scollo | Día de la defensa |

### Pendientes de la reunión anterior

- Verificación manual sobre la URL desplegada en Render y grabación del video de demostración: completadas.

## 2026-10-14 — Cierre de economía de juego, validación de compras por nivel y despliegue a producción (Render + Supabase)

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión sincrónica de coordinación, revisión conjunta de código y verificación de despliegue.

### Temas tratados

- **Economía de juego y compra de objetos no únicos (PR #72, PR #73 y PR #76):** Se implementó la regla de negocio para permitir la compra continua e ilimitada de objetos comunes/consumibles (clonando una nueva instancia física en el inventario del comprador mientras la plantilla permanece en la tienda), asignando de forma automática el ítem al primer casillero desocupado y evitando que los ítems vendidos reaparezcan duplicados en el catálogo de la tienda (Octavio Gudiño).
- **Validación estricta de nivel en compras:** Se acordó bloquear la adquisición de objetos cuyo requisito de nivel sea superior al nivel actual del personaje. Se implementó una doble validación: en el frontend (botón deshabilitado con aviso explicativo al usuario) y en el backend (retorno de código HTTP 400). Se agregaron fixtures y nuevos casos de prueba en las suites de pruebas (`src/tests/item.purchase.test.ts` y `src/integration/game.test.ts`) para garantizar que la restricción sea inviolable (Alejandro Ciesco y Octavio Gudiño).
- **Optimización visual y catálogo limpio de tienda:** Se depuró la vista del catálogo de tiendas para agrupar ítems por definición y ocultar copias individuales redundantes. Se rediseñaron las tarjetas de productos y se aseguró la persistencia del detalle expandido en el inventario (Octavio Gudiño y Franco Testi).
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
| Ajustes finales de UI móvil, filtros de inventario por personaje y refactor de nomenclatura | Franco Testi, Alejandro Ciesco y Renzo Scollo | 2026-10-16 |
| Auditoría final de la documentación de entrega, video de demo y credenciales | Emanuel Salomón y Octavio Gudiño | 2026-10-16 |

### Pendientes de la reunión anterior

- Despliegue en la nube y configuración de variables de entorno de producción: resuelto satisfactoriamente.

## 2026-10-13 — Estabilización de calidad, resolución de linter y optimización de tienda del anfitrión

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de revisión de código (code review) y coordinación técnica.

### Temas tratados

- **Resolución integral de advertencias de linter (PR #70):** Se abordaron todas las advertencias reportadas por `oxlint` en el frontend, depurando variables sin uso, unificando tipados estrictos y asegurando un build limpio y sin advertencias en los pipelines de integración continua (Renzo Scollo).
- **Aislamiento de bases de datos para pruebas (PR #70):** Se consolidó el soporte para la variable `TEST_DB_URL`, permitiendo que las pruebas de integración backend de MikroORM corran contra un esquema temporal aislado, desacoplándolas de la base de datos de desarrollo y producción (Renzo Scollo y Emanuel Salomón).
- **Optimización de la tienda del Anfitrión (PR #71):** Se actualizó la interfaz y el flujo de configuración con el que el usuario anfitrión administra el inventario, catálogo y precios de los objetos de su partida (Octavio Gudiño y Franco Testi).

### Decisiones

- Todo pull request debe superar el linter (`npm run lint`) con cero advertencias antes de ser integrado a `main`.
- La suite de pruebas de integración debe ser totalmente reproducible y autónoma mediante la variable `TEST_DB_URL`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Implementar las reglas de compra infinita para objetos no únicos y validación de nivel requerido | Octavio Gudiño y Alejandro Ciesco | 2026-10-14 |
| Preparar scripts de compilación (`build:all`) y configurar el despliegue en Render | Franco Testi y Emanuel Salomón | 2026-10-14 |

### Pendientes de la reunión anterior

- Centralización de avisos y notificaciones en modales accesibles: completado con la implementación de `NoticeModal` (originalmente `AvisoModal`).

## 2026-10-12 — Refactor visual e iconografía SVG, sistema de alertas en español y robustez E2E

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de diseño, accesibilidad y coordinación de pruebas automatizadas.

### Temas tratados

- **Estandarización de interfaz con iconografía SVG (PR #68 y PR #69):** Se aplicó el reemplazo sistemático de emojis por iconos vectoriales SVG limpios y consistentes en toda la aplicación, logrando un aspecto más profesional y accesible (Franco Testi).
- **Sistema unificado de notificaciones (`NoticeModal` / `AvisoModal`):** Se implementó un componente modal centralizado para presentar confirmaciones, avisos y errores en español neutro, erradicando alertas estándar del navegador o mensajes técnicos crudos (Franco Testi y Renzo Scollo).
- **Contexto de juego en personajes:** Se enriquecieron las tarjetas de personajes mostrando la partida asociada a cada uno, facilitando la visualización global del estado de juego tanto para jugadores como para anfitriones (Alejandro Ciesco).
- **Accesibilidad y calibración visual de temas:** Se afinaron los acentos y contrastes en modo claro y modo oscuro para garantizar el cumplimiento de los estándares WCAG 2 AA, y se rediseñó la visualización de estadísticas de los personajes (Renzo Scollo y Franco Testi).
- **Robustez de pruebas E2E en Playwright:** Se ajustaron selectores semánticos (`aria-label="XP:"`, etiquetas de recompensas) para evitar fragilidades en las pruebas automatizadas de reparto de premios y misiones, garantizando ejecuciones confiables en el CI (Renzo Scollo).

### Decisiones

- Queda prohibido el uso de emojis en los componentes de interfaz; toda la iconografía debe emplear componentes SVG.
- Las notificaciones y alertas al usuario deben canalizarse exclusivamente a través del componente modal unificado (`NoticeModal`).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Limpieza de advertencias de linter (`oxlint`) en el frontend y soporte de `TEST_DB_URL` | Renzo Scollo | 2026-10-13 |
| Refinar la gestión y actualización de la tienda del anfitrión | Octavio Gudiño | 2026-10-13 |

### Pendientes de la reunión anterior

- Segregación estricta de navegación según rol: resuelta e integrada en PR #67.

## 2026-10-09 — Implementación integral de roles (Jugador/Anfitrión), misiones y tiendas por partida y unificación de interfaz

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de integración, resolución de conflictos de ramas y planificación de requerimientos de negocio.

### Temas tratados

- **Resolución colaborativa de ramas de interfaz (PR #65 y PR #66):** El equipo integró las propuestas visuales desarrolladas, preservando la paleta personalizada de botones (violeta por defecto), la barra superior flotante con autocierre de menús desplegables y corrigiendo selectores de opciones con regex en Playwright para evitar timeouts en el CI (Franco Testi y Renzo Scollo).
- **Implementación integral de reglas de roles y partidas (PR #67):**
  - **Diferenciación estricta de roles:** Se implementó la segregación de accesos entre el rol de Jugador (crear personaje, unirse a partida, gestionar inventario) y el rol de Anfitrión (crear y gestionar partida, administrar misiones y tiendas), adaptando dinámicamente la navegación del sistema y validando permisos en el servidor (Emanuel Salomón y Alejandro Ciesco).
  - **Tiendas y misiones contextuales por partida:** Se acopló la creación y gestión de tiendas y misiones a cada partida particular, garantizando que los jugadores solo interactúen con los contenidos definidos por su anfitrión (Franco Testi y Octavio Gudiño).
  - **Objetos únicos y venta instantánea:** Se incorporó la regla de no reaparición de objetos únicos en tiendas tras ser comprados y la venta inmediata de ítems a cambio de oro (Octavio Gudiño).
  - **Accesibilidad y diseño responsivo:** Se mejoró la accesibilidad en controles `<select>`, campos numéricos de precio en inventarios y la adaptabilidad fluida en resoluciones móviles (Renzo Scollo).

### Decisiones

- La navegación y permisos de la aplicación quedan estrictamente supeditados al rol activo del usuario en la partida.
- El catálogo de tiendas y el registro de misiones pertenecen al ámbito de cada partida específica y no tienen alcance global.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Reemplazar emojis por componentes SVG vectoriales y mostrar partida en tarjetas de personaje | Franco Testi y Alejandro Ciesco | 2026-10-12 |
| Unificar cuadros de diálogo y avisos del sistema en español y ajustar selectores E2E | Franco Testi y Renzo Scollo | 2026-10-12 |

### Pendientes de la reunión anterior

- Pruebas unitarias de layout y verificación de contraste: completadas con éxito.

## 2026-10-08 (Tarde) — Formalización metodológica ágil, soporte multi-tema (claro/oscuro) y diseño Bento Grid

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Taller metodológico, sesión de diseño visual y revisión de integración continua.

### Temas tratados

- **Documentación de metodología y seguimiento del equipo (PR #59, PR #60 y PR #61):** Se redactaron y formalizaron en `docs/metodologia.md`, `docs/trackeo.md` y `docs/seguimiento.md` los lineamientos de trabajo bajo Scrum y Kanban, la trazabilidad de requerimientos y el enlace directo al tablero oficial de GitHub Projects (Franco Testi y Emanuel Salomón).
- **Soporte dinámico de temas claro y oscuro (PR #63):** Se diseñó e implementó la arquitectura de temas mediante `ThemeContext` y el componente interactivo `ThemeToggle`, acompañada por una suite completa de pruebas unitarias que superó los umbrales de cobertura exigidos (Renzo Scollo y Franco Testi).
- **Auditoría de accesibilidad WCAG 2 AA:** Se revisaron y ajustaron los tokens de color para garantizar ratios de contraste conformes a las pautas WCAG 2 AA en ambos temas, y se eliminó el anidamiento interactivo no permitido en las tarjetas de personajes (Renzo Scollo).
- **Evolución visual Bento Grid (PR #64):** Se adoptó una estética moderna basada en cuadrícula *Bento Grid*, incorporando la tipografía *Plus Jakarta Sans*, barra de navegación flotante con efecto *glassmorphism*, personalización de color de botones y autocierre de menús desplegables (Franco Testi).
- **Pruebas unitarias de layout y componentes clave:** Se agregaron pruebas para `DashboardPage` y `MainLayout`, asegurando que la cobertura de funciones del frontend supere el 36 % exigido por las políticas de calidad (Renzo Scollo).

### Decisiones

- Se establece el diseño Bento Grid y el soporte nativo de tema claro/oscuro como estándar visual definitivo de la aplicación.
- El avance y seguimiento de tareas se sincroniza activamente a través del tablero de GitHub Projects y la documentación en `docs/`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Coordinar la integración de ramas de diseño y avanzar en la segregación de roles por partida | Franco Testi, Emanuel Salomón, Alejandro Ciesco y Octavio Gudiño | 2026-10-09 |
| Reforzar la suite de pruebas E2E ante los nuevos cambios visuales | Renzo Scollo | 2026-10-09 |

### Pendientes de la reunión anterior

- Puesta al día de todos los integrantes con la base de datos de Supabase: completada.

## 2026-10-08 (Mañana) — Puesta al día de la migración a PostgreSQL y estabilización de interfaz

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión sincrónica de sincronización técnica y distribución de tareas.

### Temas tratados

- **Sincronización de entornos de desarrollo locales:** Cada integrante actualizó su copia local mediante `git pull` sobre `main`, ejecutó `npm ci`, completó su archivo `.env` con la cadena de conexión de Supabase y verificó el acceso con `npm run db:probar`.
- **Gestión centralizada de accesos a la base de datos:** Se coordinó la provisión de accesos para todos los miembros del equipo al panel de administración de Supabase (Emanuel Salomón).
- **Estabilización de mejoras visuales del frontend (PR #58):** Se trabajó sobre la rama `feat/frontend-mejoras-visuales` para reintegrar componentes clave de interfaz (barra superior con menús desplegables, formularios, avatares y visor de imágenes), corrigiendo el orden de hooks en `UserDetail` (antes `UsuarioDetalle`) y el desborde responsivo a 375 px para asegurar que pasen todos los checks del CI (Franco Testi en diseño y Renzo Scollo en ajustes de CI).
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
| Desarrollar el soporte de tema oscuro y claro con pruebas unitarias | Renzo Scollo y Franco Testi | 2026-10-08 (Tarde) |

### Pendientes de la reunión anterior

- Evaluación de la latencia y rendimiento de las consultas hacia Supabase: se mantiene bajo monitoreo.

## 2026-10-07 — Migración de persistencia a PostgreSQL (Supabase) y estrategia de integración continua

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión técnica de evaluación arquitectónica y resolución de contingencias.

### Temas tratados

- **Debate técnico sobre infraestructura de persistencia:** El equipo evaluó la transición técnica de MySQL (`@mikro-orm/mysql`) hacia PostgreSQL en Supabase, sopesando alternativas en la nube (Aiven, Railway, Render, Vercel, Netlify). Se consensuó avanzar de manera definitiva con Supabase y PostgreSQL para contar con una base de datos administrada y accesible para todo el equipo sin depender de servidores locales.
- **Ejecución coordinada de la migración y bloqueos pesimistas (PR #54):** Se adaptó el backend a PostgreSQL utilizando `@mikro-orm/postgresql`, implementando la consulta paralela de usuarios y roles, resolviendo la incompatibilidad de `SELECT ... FOR UPDATE` en `LEFT JOIN` mediante `strategy: 'select-in'` para las compras y ventas concurrentes, configurando pruebas de integración y E2E sobre esquemas temporales aislados e incorporando los scripts `db:rls` y `db:probar` junto con la defensa CSRF (Emanuel Salomón y Octavio Gudiño).
- **Guía de actualización para el equipo:** Se elaboró y publicó `TUTORIAL.md` en la raíz del repositorio detallando los pasos para que todos los integrantes configuren sus entornos locales con Supabase (PR #57, Emanuel Salomón).
- **Control de estabilidad en CI (PR #52 y PR #55):** Ante fallas de lint y E2E provocadas por desajustes visuales, se resolvió revertir de forma preventiva las modificaciones de interfaz para preservar la estabilidad de `main`, conservándolas en una rama de trabajo para resolver las inconsistencias (Franco Testi y Emanuel Salomón).
- **Preparación de datos de prueba y diseño de perfiles:** Se coordinó la carga estandarizada de datos de demostración mediante `npm run demo:datos`, y se consensuó usar la letra inicial en avatares de reemplazo para evitar desbordes visuales.
- **Monitoreo y aprobación de ajustes de CI:** Se revisaron y aprobaron PRs de corrección en flujos de integración continua (#51, #53, #56, Renzo Scollo con asistencia del revisor automático).

### Decisiones

- Supabase (PostgreSQL) se establece como la base de datos compartida y oficial del proyecto.
- Se prioriza la estabilización del pipeline de CI: ningún cambio de frontend puede ingresar a `main` sin tener los tres checks (lint, build y tests) en verde.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Sincronizar copias locales (`git pull`, `npm ci`, `.env` y `npm run db:probar`) | Todo el equipo | 2026-10-08 |
| Estabilizar y corregir inconsistencias en la rama de mejoras visuales (PR #58) | Franco Testi y Renzo Scollo | 2026-10-08 |

### Pendientes de la reunión anterior

- Verificaciones de módulos de fin de septiembre (PR #41 a #48): completadas e integradas en `main`.

## 2026-09-22 — Ensayo general, auditoría de calidad y coordinación de la presentación del proyecto

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Ensayo sincrónico, revisión de pruebas de cierre y calibración de exposición grupal.

### Temas tratados

- **Revisión de calidad visual, responsive y accesibilidad (PR #38):** Se revisaron los resultados de los recorridos responsivos en 375, 768 y 1280 px y la auditoría WCAG 2.0 A/AA con `axe-core`, junto con las mejoras de comercio y sesiones de las semanas 17 a 23 (PR #36 de Octavio Gudiño y PR #37 de Franco Testi).
- **Ensayo general y cronometrado grupal:** El equipo realizó un ensayo completo de la presentación evaluando los tiempos de exposición por bloque (promediando entre 4 y 5 minutos por integrante), asegurando que la duración total se encuadre en el límite estipulado por la cátedra.
- **Revisión de temas y complementariedad:** Se repasó la articulación entre los cinco ejes asignados (Franco Testi en arquitectura y partidas; Octavio Gudiño en economía y concurrencia; Emanuel Salomón en seguridad, `scrypt` y cuentas; Alejandro Ciesco en personajes, clases e inventario inicial; Renzo Scollo en frontend React, testing y CI/CD).
- **Planificación de la demostración práctica en vivo:** Se acordó que la demostración del sistema en funcionamiento se realice de punta a punta desde la interfaz del frontend con dos sesiones simultáneas (Anfitrión y Jugador).

### Decisiones

- Mantener los tiempos de exposición calibrados en el ensayo para garantizar una presentación equilibrada.
- Completar durante la semana las evidencias documentales de pruebas, concurrencia, `api.md` e instalación limpia (que luego se integraron en los PR #40 a #48).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Revisar `api.md`, validar error 413 (> 64 KB) y consolidar script `demo:datos` | Emanuel Salomón | 2026-09-24 |
| Documentar evidencia de pruebas, cobertura e inspección responsive (PR #40, #47, #48) | Renzo Scollo | 2026-09-29 |
| Documentar verificación de concurrencia y checklist de tiendas/inventarios (PR #41, #43) | Octavio Gudiño | 2026-09-26 |
| Actualizar `api.md` con rutas de sesiones/misiones (PR #44, #45) | Franco Testi | 2026-09-26 |
| Documentar verificación de instalación y checklist de clases/personajes (PR #46) | Alejandro Ciesco | 2026-09-29 |

### Pendientes de la reunión anterior

- Integración de todos los módulos del alcance de aprobación y suite E2E en CI: completada entre el 14/09 y el 21/09.

## 2026-09-09 — Integración de autenticación, sesiones, misiones, personajes, comercio transaccional y suite E2E

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de integración de módulos principales y cierre funcional.

### Temas tratados

- **Rutas, cuentas, perfiles y seguridad (PR #23, PR #24 y PR #26):** Se dividió el frontend en páginas y rutas protegidas (Emanuel Salomón), se estandarizaron las validaciones de usuario (Octavio Gudiño) y se integró la autenticación con contraseñas hasheadas (`scrypt` + `timingSafeEqual`), cookies `HttpOnly`/`SameSite=Strict` y autorización por rol en el servidor (Renzo Scollo y Emanuel Salomón).
- **Clases, creación atómica de personajes y acceso a partidas (PR #28):** Se integró el módulo de clases y el caso de uso Crear Personaje, garantizando en una única transacción la inicialización de estadísticas base (nivel 1, 0 XP, 100 de oro) y la creación del inventario principal #1 con capacidad de 10 casillas (Alejandro Ciesco).
- **Comercio transaccional, inventarios, compra y venta (PR #25, PR #29 y PR #31):** Se implementaron las operaciones transaccionales de compra con bloqueo pesimista, movimiento de objetos entre inventarios y venta dentro del rango permitido del 70 % al 100 % (Octavio Gudiño y Renzo Scollo).
- **Sesiones, participantes, misiones y calificación del anfitrión (PR #27, PR #30 y PR #32):** Se integró el ciclo completo de sesiones (`planificada` → `en curso` → `finalizada`), el registro de participantes, la distribución transaccional de recompensas al completar misiones y el voto único de karma al anfitrión (Franco Testi y Renzo Scollo).

### Decisiones

- Incorporar una suite de pruebas E2E automatizadas con Playwright y un pipeline de integración continua en GitHub Actions para blindar `main` ante regresiones de compilación o de flujo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar el flujo de sesiones y misiones (PR #32) | Franco Testi | 2026-09-11 |
| Implementar la suite E2E con Playwright, `NotFoundPage` y workflow de GitHub Actions (PR #33, #34) | Renzo Scollo | 2026-09-14 |
| Completar pantallas de perfiles de usuario y manejo de caída del backend (commits 15/09) | Emanuel Salomón | 2026-09-15 |
| Ampliar pruebas del módulo de clases, personajes y acceso a partidas (PR #35) | Alejandro Ciesco | 2026-09-16 |
| Refinar validaciones y mejoras del módulo de comercio (PR #36) | Octavio Gudiño | 2026-09-18 |

### Pendientes de la reunión anterior

- Desarrollo de los cinco módulos de dominio en backend y frontend: completado.

## 2026-08-24 — Implementación de módulos del dominio, validaciones Zod y primeros componentes de frontend

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de sincronización de desarrollo por módulo.

### Temas tratados

- **Validaciones con esquemas Zod, DTOs y CORS (PR #18 y PR #19):** Se incorporó la validación de entrada con Zod, la capa *repository* y los controladores base con DTOs y configuración de CORS para clases, objetos y tiendas (Franco Testi).
- **Módulos de jugador, anfitrión y partida:** Se desarrollaron los servicios, controladores y vistas iniciales para la administración de jugadores, anfitriones y partidas (Franco Testi).
- **Módulo de clases y caso de uso Crear Personaje:** Se implementó el CRUD de clases y la lógica inicial de creación de personajes asociada a un jugador y una partida (Alejandro Ciesco).
- **Tipado estricto de usuarios y frontend de objetos (PR #21 y PR #22):** Se eliminaron usos de `any` estandarizando el modelo de usuario (Octavio Gudiño) y se estructuró el frontend de objetos junto con la organización inicial de la carpeta `docs/` (Renzo Scollo).

### Decisiones

- Estandarizar el uso de DTOs y validadores en todos los endpoints antes de pasar a la integración de los casos de uso complejos (compra/venta, sesiones y misiones).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Dividir el frontend en páginas con React Router y refactorizar `UsersPage` (PR #23) | Emanuel Salomón | 2026-09-01 |
| Reforzar validaciones de usuario y desarrollar el módulo de comercio (PR #24, #29, #31) | Octavio Gudiño | 2026-09-07 |
| Desarrollar compra transaccional, autenticación y gestión de inventarios (PR #25, #26) | Renzo Scollo y Emanuel Salomón | 2026-09-07 |
| Desarrollar el CRUD de sesiones, participantes y calificación del anfitrión (PR #27) | Franco Testi | 2026-09-07 |
| Completar los módulos de clases y personajes en frontend y backend (PR #28) | Alejandro Ciesco | 2026-09-07 |

### Pendientes de la reunión anterior

- CRUD de usuarios integrado con la API (PR #17): completado el 13/08.

## 2026-08-12 — Presentación de la prueba de concepto, configuración de base de datos y planificación de pruebas

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión técnica y organizativa.

### Temas tratados

- **Configuración de base de datos y estabilización del backend (PR #13, PR #14 y PR #15):** Se documentó la configuración de la base de datos y se restauraron los archivos del servidor Node.js que se habían retirado por error en un merge previo (Franco Testi).
- **Integración del CRUD de usuarios con la API (PR #17):** Se revisó la conexión de punta a punta del módulo de usuarios entre React y Express/MikroORM (Renzo Scollo).
- **Definición de estrategia de pruebas E2E:** El equipo evaluó e incorporó Playwright dentro de la hoja de ruta de calidad para las pruebas de extremo a extremo (cuya integración completa en CI quedó programada para septiembre una vez cerrados los flujos de negocio).
- **Distribución equitativa de temas de exposición:** Se acordó el reparto balanceado de los temas de la prueba de concepto para la presentación grupal, abarcando arquitectura en capas, ORM, seguridad, reglas de dominio y demostración de código.
- **Sincronización y revisión de pull requests:** El equipo acordó mantener limpio el árbol del repositorio y reforzar buenas prácticas para la publicación y sincronización de ramas de trabajo (`git push -u origin <rama>`).

### Decisiones

- Todo desarrollo nuevo debe integrarse mediante pull request con revisión compartida.
- Avanzar sobre el molde del CRUD de usuarios (PR #17) para construir el resto de las entidades y validaciones.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Finalizar e integrar el CRUD de usuarios con la API (PR #17) | Renzo Scollo | 2026-08-13 |
| Incorporar validaciones con Zod y los CRUD de clases, objetos y tiendas (PR #18, #19) | Franco Testi | 2026-08-21 |
| Desarrollar el CRUD de clases y el caso de uso Crear Personaje | Alejandro Ciesco | 2026-08-24 |
| Estandarizar el tipado de usuario eliminando `any` (PR #21) | Octavio Gudiño | 2026-08-24 |

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
- **Revisión colaborativa de controladores (PR #12):** Se validó la corrección en el controlador de usuarios, asegurando la conversión numérica estricta mediante `parseInt` y la validación adecuada de identificadores en rutas (Franco Testi).
- **Estandarización del comando de inicio:** Se acordó y documentó el comando unificado `npm run dev` para levantar el entorno de desarrollo local de manera homogénea en todos los puestos de trabajo.

### Decisiones

- El nuevo diagrama entidad-relación (`DER_NEW.png`) constituye la referencia oficial del modelo de datos.
- Se adopta `npm run dev` como script estándar para desarrollo local.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar y expandir la API de usuarios con sus rutas asociadas (PR #13 y PR #17) | Franco Testi y Renzo Scollo | 2026-08-12 |

### Pendientes de la reunión anterior

- Servidor Express (PR #9) y alineación con directivas de la cátedra (PR #10): resueltos favorablemente.

## 2026-07-17 — Definición de arquitectura en capas, stack MikroORM y esquema de persistencia

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de diagnóstico técnico y diseño arquitectónico.

### Temas tratados

- **Diagnóstico del estado del proyecto:** El equipo analizó en conjunto la situación del prototipo inicial (el cual operaba con datos en memoria) y definió los requerimientos estructurales exigidos por la cátedra: API REST con Express en arquitectura en capas, persistencia profesional con MikroORM, configuración protegida mediante `.env`, autenticación en dos niveles (jugador y anfitrión) con protección de rutas y pruebas automatizadas.
- **Estrategia de desarrollo vertical testigo:** Se acordó implementar como molde arquitectónico completo el CRUD de Usuario de punta a punta: React → fetch → Express → Service → MikroORM → Base de datos, de modo que sirva como plantilla reproducible para las demás entidades.
- **Configuración de dependencias y paquetes (PR #5 y PR #6):** Se instalaron y configuraron colaborativamente `@mikro-orm/core@6`, `dotenv` y `tsx`, reestructurando el repositorio y completando el modelo unificado (Renzo Scollo).
- **Definición de estructura y variables de entorno:** Se consensuó la distribución de paquetes en capas (`entities`, `services`, `controllers`, `routes`) y se definieron las variables requeridas en `.env`.
- **Creación de tablas y datos iniciales:** Se ejecutaron pruebas de creación de esquemas (`npm run schema:create`) y se cargaron de forma colaborativa las clases de D&D y los datos de prueba de usuarios y jugadores, consolidando el script integral `CREATE TABLE`.

### Decisiones

- Desarrollar la entidad Usuario de extremo a extremo como modelo testigo para las demás entidades.
- Implementar la persistencia mediante MikroORM protegiendo todas las credenciales mediante variables de entorno.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Implementar el servidor Express base y las nueve entidades restantes del modelo relacional (PR #7, #8, #9, #10, #11) | Renzo Scollo | 2026-07-27 |
| Validar controladores y consolidar datos de prueba y clases de personajes (PR #12) | Franco Testi y Alejandro Ciesco | 2026-07-31 |

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

- **Modelado de interfaces TypeScript:** El equipo definió de manera colaborativa el archivo `interfaces.ts` conteniendo las 12 interfaces del esquema relacional, estandarizando el tratamiento de claves foráneas como identificadores numéricos y contemplando la nulabilidad según las reglas de negocio (por ejemplo, ubicación condicional de un objeto en una tienda o en un inventario).
- **Normalización de nomenclatura:** Se unificó transversalmente la propiedad `contrasena` (sin caracteres especiales) para garantizar interoperabilidad sin fricciones entre base de datos, API y cliente.
- **Adaptación de datos de prueba (`mockData.ts`):** Se alinearon los mocks al nuevo contrato de interfaces, validando el esquema en el cual un usuario puede desempeñarse tanto en el rol de jugador como de anfitrión.
- **Depuración de prototipos anteriores:** Se acordó dar por superado el archivo preliminar de prototipo (`TP_DSW.ts`) y sincronizar el nuevo modelo en el repositorio del equipo.

### Decisiones

- Adoptar el modelo de datos con `Usuario` como entidad base común para `Jugador` y `Anfitrion`.
- Estandarizar la propiedad de clave de acceso bajo la nomenclatura `contrasena` en todo el proyecto.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Sincronizar e integrar el nuevo modelo de interfaces en el repositorio (PR #5) | Renzo Scollo y Franco Testi | 2026-07-17 (completado) |

### Pendientes de la reunión anterior

- Definición del esquema relacional: completada el 10/07.

## 2026-07-10 — Consolidación del esquema relacional y adopción de stack tecnológico

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Mesa de diseño de persistencia y consenso de arquitectura.

### Temas tratados

- **Diseño del esquema de base de datos:** El equipo estructuró y consensuó el esquema relacional con sus claves primarias y foráneas para las 12 entidades del dominio: Usuario, Jugador, Anfitrion, Partida, Sesion, Mision, Clase, Tienda, Personaje, Inventario, Personaje_Sesion y Objeto.
- **Elección del stack de persistencia:** Tras analizar diversas alternativas técnicas, se acordó por unanimidad la adopción de MySQL junto con MikroORM como tecnología de mapeo objeto-relacional (ORM).
- **Conectividad inicial a base de datos (PR #2):** Se estructuró el archivo `db.ts`, se incorporó `mysql2` y se llevaron a cabo pruebas conjuntas de acceso a una instancia compartida de base de datos para validar la conectividad grupal (Emanuel Salomón).

### Decisiones

- Se define el stack tecnológico de persistencia inicial: MySQL + MikroORM.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Definir las interfaces TypeScript del esquema relacional | Franco Testi, Alejandro Ciesco y Renzo Scollo | 2026-07-13 |
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
| Elaborar el esquema relacional de las 12 entidades | Todo el equipo | 2026-07-10 |

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

- **Definición de métodos y responsabilidades por clase:** En sesión conjunta se diseñó el catálogo de métodos necesarios para las entidades del juego:
  - `Partida`: inicialización, avance secuencial de turnos y desvinculación de jugadores (Franco Testi).
  - `Personaje`: equipamiento y desequipamiento de objetos con validación de nivel y sustitución automática de ítems (Alejandro Ciesco).
  - `Tienda`: flujos transaccionales de compra y venta de objetos (Octavio Gudiño).
  - `Jugador` / `Anfitrion`: unión a partidas y administración de participantes (Emanuel Salomón y Franco Testi).
  - `Sesion`: registro cronológico de acciones y eventos de la partida (Franco Testi).
- **Desarrollo colaborativo de operaciones comerciales:** Se definieron y programaron en equipo las funciones `buscarObjeto`, `iniciarVenta`, `venderObjeto` y `comprarObjeto`, estableciendo el cálculo de monedas de oro y el factor de reventa.

### Decisiones

- La venta de un objeto acredita dinero al personaje según el factor de reventa y actualiza la disponibilidad según las reglas del objeto.
- Adquirir o equipar un objeto requiere obligatoriamente que el nivel del personaje sea igual o superior al nivel exigido por el objeto.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Integrar y depurar las primeras clases de la lógica del juego en el repositorio (PR #1) | Emanuel Salomón | 2026-05-15 |
| Desarrollar lógica de partidas, sesiones, personajes y clases | Franco Testi y Alejandro Ciesco | 2026-05-15 |
| Completar lógica de compra y venta de objetos y tiendas | Octavio Gudiño | 2026-05-15 |

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
