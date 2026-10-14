# Minutas de reunión

> Registro de reuniones de seguimiento, acuerdos técnicos y coordinación del equipo de desarrollo.
> Refleja el trabajo colaborativo, las decisiones arquitectónicas consensuadas y la evolución del proyecto.

## Equipo de desarrollo

| Integrante | Áreas principales de coordinación y desarrollo en equipo |
| --- | --- |
| Franco Testi | Coordinación de arquitectura, modelo de dominio y persistencia, módulos de juego y diseño de interfaz |
| Renzo Scollo | Arquitectura backend en capas, integración continua (CI), pruebas unitarias y E2E, accesibilidad y componentes transversales |
| Alejandro Ciesco | Módulos de clases, personajes, control de acceso a partidas y aseguramiento de calidad |
| Octavio Gudiño | Lógica de comercio, inventarios, transacciones de objetos y gestión de sesiones |
| Emanuel Salomón | Autenticación, perfiles, migración a base de datos en la nube, infraestructura y documentación técnica de entrega |

## Minutas

<!-- Agregar las minutas acá, la más reciente primero. -->

## 2026-10-14 — Cierre de economía de juego, validación de compras por nivel y despliegue a producción (Render + Supabase)

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión sincrónica de coordinación, revisión conjunta de código y verificación de despliegue.

### Temas tratados

- **Economía de juego y compra de objetos no únicos (PR #72 y PR #73):** El equipo coordinó e implementó la regla de negocio para permitir la compra continua e ilimitada de objetos no únicos (consumibles, municiones, pociones), asignando de forma automática el ítem al primer casillero desocupado de la cuadrícula del inventario y evitando que los ítems vendidos reaparezcan incorrectamente en el catálogo de la tienda.
- **Validación estricta de nivel en compras:** Se acordó bloquear la adquisición de objetos cuyo requisito de nivel sea superior al nivel actual del personaje. Se implementó una doble validación: en el frontend (botón deshabilitado con aviso explicativo al usuario) y en el backend (retorno de código HTTP 400). Se agregaron fixtures y nuevos casos de prueba en la suite de integración (`src/tests/compra.test.ts`) para garantizar que la restricción sea inviolable.
- **Optimización visual y catálogo limpio de tienda:** Se depuró la vista del catálogo de tiendas para agrupar ítems por definición y ocultar copias o instancias individuales redundantes. Se rediseñaron las tarjetas de productos y se aseguró la persistencia del detalle expandido en el inventario.
- **Configuración integral de despliegue en la nube (PR #74):** Se estandarizó el script `npm run build:all` para compilar de manera unificada backend y frontend, se ajustó `tsconfig.json` para excluir tests del empaquetado final en `dist`, se incorporó `@types/pg` en dependencias de producción y se habilitó el endpoint `/activas` en el backend para monitoreo y comprobación de partidas en curso.
- **Verificación en vivo en Render y Supabase:** El equipo verificó el despliegue exitoso del servicio web en la plataforma Render bajo una arquitectura Same-Origin (el backend Express sirve tanto la API `/api` como los estáticos de React compilados), conectado mediante SSL seguro al Session Pooler de PostgreSQL en Supabase.
- **Actualización de documentación para la cátedra:** Se completaron y sincronizaron colaborativamente los documentos `docs/despliegue.md`, `docs/demo.md` y `docs/entrega.md`, registrando la URL pública activa del despliegue y las credenciales de demo para los roles de Anfitrión y Jugador.

### Decisiones

- Los objetos no únicos admiten compra infinita; los objetos únicos se reservan exclusivamente para una sola compra por partida.
- La restricción de nivel para compra de ítems es obligatoria y se valida de forma estricta tanto en cliente como en servidor.
- La aplicación queda formalmente publicada y operativa en la nube para la evaluación docente.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Verificación manual exhaustiva sobre la URL desplegada en Render | Todo el equipo | Inmediato |
| Auditoría final de la documentación de entrega y credenciales de demo | Todo el equipo | Antes de la entrega |

### Pendientes de la reunión anterior

- Despliegue en la nube y configuración de variables de entorno de producción: resuelto satisfactoriamente.

## 2026-10-13 — Estabilización de calidad, resolución de linter y optimización de tienda del anfitrión

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de revisión de código (code review) y coordinación técnica.

### Temas tratados

- **Resolución integral de advertencias de linter (PR #70):** El equipo abordó colaborativamente todas las advertencias reportadas por `oxlint` en el frontend, depurando variables sin uso, unificando tipados estrictos y asegurando un build limpio y sin advertencias en los pipelines de integración continua.
- **Aislamiento de bases de datos para pruebas:** Se incorporó el soporte para la variable `TEST_DB_URL`, permitiendo que las pruebas de integración backend de MikroORM corran contra un esquema temporal o base independiente, desacoplándola de la base de datos de desarrollo y producción.
- **Optimización de la tienda del Anfitrión (PR #71):** En trabajo conjunto se actualizó la interfaz y el flujo de configuración con el que el usuario anfitrión administra el inventario, catálogo y precios de los objetos de su partida.

### Decisiones

- Todo pull request debe superar el linter (`npm run lint`) con cero advertencias antes de ser integrado a `main`.
- La suite de pruebas de integración debe ser totalmente reproducible y autónoma mediante la variable `TEST_DB_URL`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Implementar las reglas de compra infinita para objetos no únicos y validación de nivel | Equipo de comercio y backend | 2026-10-14 |
| Preparar scripts de compilación para despliegue en producción | Equipo de infraestructura | 2026-10-14 |

### Pendientes de la reunión anterior

- Centralización de avisos y notificaciones en modales accesibles: completado con la implementación de `AvisoModal`.

## 2026-10-12 — Refactor visual e iconografía SVG, sistema de alertas en español y robustez E2E

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de diseño, accesibilidad y coordinación de pruebas automatizadas.

### Temas tratados

- **Estandarización de interfaz con iconografía SVG (PR #68 y PR #69):** El equipo consensuó y aplicó el reemplazo sistemático de emojis por iconos vectoriales SVG limpios y consistentes en toda la aplicación, logrando un aspecto más profesional y accesible.
- **Sistema unificado de notificaciones (`AvisoModal`):** Se implementó un componente modal centralizado para presentar confirmaciones, avisos y errores en español neutro, erradicando alertas estándar del navegador o mensajes técnicos crudos.
- **Contexto de juego en personajes:** Se enriquecieron las tarjetas de personajes mostrando la partida asociada a cada uno, facilitando la visualización global del estado de juego tanto para jugadores como para anfitriones.
- **Accesibilidad y calibración visual de temas:** Se afinaron los acentos y contrastes en modo claro y modo oscuro para garantizar el cumplimiento de los estándares WCAG 2 AA, y se rediseñó la visualización de estadísticas de los personajes.
- **Robustez de pruebas E2E en Playwright:** Se ajustaron selectores semánticos (`aria-label="XP:"`, etiquetas de recompensas `$$:`) para evitar fragilidades en las pruebas automatizadas de reparto de premios y misiones, garantizando ejecuciones confiables en el CI.

### Decisiones

- Queda prohibido el uso de emojis en los componentes de interfaz; toda la iconografía debe emplear componentes SVG.
- Las notificaciones y alertas al usuario deben canalizarse exclusivamente a través del componente `AvisoModal`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Limpieza de advertencias de linter en el frontend | Equipo de frontend | 2026-10-13 |
| Refinar la gestión y actualización de la tienda del anfitrión | Equipo de comercio | 2026-10-13 |

### Pendientes de la reunión anterior

- Segregación estricta de navegación según rol: resuelta e integrada en PR #67.

## 2026-10-09 — Implementación integral de roles (Jugador/Anfitrión), misiones y tiendas por partida y unificación de interfaz

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Sesión de integración, resolución de conflictos de ramas y planificación de requerimientos de negocio.

### Temas tratados

- **Resolución colaborativa de ramas de interfaz (PR #65 y PR #66):** El equipo integró las propuestas visuales desarrolladas, preservando la paleta personalizada de botones (violeta por defecto), la barra superior flotante con autocierre de menús desplegables y corrigiendo selectores de opciones con regex en Playwright para evitar timeouts en el CI.
- **Implementación integral de reglas de roles y partidas (PR #67):**
  - **Diferenciación estricta de roles:** Se implementó la segregación de accesos entre el rol de Jugador (crear personaje, unirse a partida, gestionar inventario) y el rol de Anfitrión (crear y gestionar partida, administrar misiones y tiendas), adaptando dinámicamente la navegación del sistema.
  - **Tiendas y misiones contextuales por partida:** Se acopló la creación y gestión de tiendas y misiones a cada partida particular, garantizando que los jugadores solo interactúen con los contenidos definidos por su anfitrión.
  - **Objetos únicos y venta instantánea:** Se incorporó la regla de no reaparición de objetos únicos en tiendas tras ser vendidos, permitiendo la venta inmediata de ítems a cambio de oro.
  - **Accesibilidad y diseño responsivo:** Se mejoró la accesibilidad en controles `<select>`, campos numéricos de precio en inventarios y la adaptabilidad fluida en resoluciones móviles.

### Decisiones

- La navegación y permisos de la aplicación quedan estrictamente supeditados al rol activo del usuario en la partida.
- El catálogo de tiendas y el registro de misiones pertenecen al ámbito de cada partida específica y no tienen alcance global.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Reemplazar emojis por componentes SVG vectoriales | Equipo de frontend | 2026-10-12 |
| Unificar cuadros de diálogo y avisos del sistema en español | Equipo | 2026-10-12 |

### Pendientes de la reunión anterior

- Pruebas unitarias de layout y verificación de contraste: completadas con éxito.

## 2026-10-08 (Tarde) — Formalización metodológica ágil, soporte multi-tema (claro/oscuro) y diseño Bento Grid

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Taller metodológico, sesión de diseño visual y revisión de integración continua.

### Temas tratados

- **Documentación de metodología y seguimiento del equipo (PR #60 y PR #61):** Se redactaron y formalizaron en `docs/metodologia.md` los lineamientos de trabajo bajo Scrum y Kanban, la gestión de historias de usuario, la trazabilidad de requerimientos y el enlace directo al tablero oficial de GitHub Projects.
- **Soporte dinámico de temas claro y oscuro (PR #63):** Se diseñó e implementó la arquitectura de temas mediante `ThemeContext` y el componente interactivo `ThemeToggle`, acompañada por una suite completa de pruebas unitarias que superó con creces los umbrales de cobertura exigidos.
- **Auditoría de accesibilidad WCAG 2 AA:** Se revisaron y ajustaron los tokens de color para garantizar ratios de contraste conformes a las pautas WCAG 2 AA en ambos temas, y se eliminó el anidamiento interactivo no permitido en las tarjetas de personajes.
- **Evolución visual Bento Grid (PR #64):** Se adoptó una estética moderna basada en cuadrícula *Bento Grid*, incorporando la tipografía *Plus Jakarta Sans*, barra de navegación flotante con efecto *glassmorphism*, personalización de color de botones (violeta por defecto) y autocierre de menús desplegables al hacer clic fuera de ellos.
- **Pruebas unitarias de layout y componentes clave:** Se agregaron pruebas para `DashboardPage` y `MainLayout`, asegurando que la cobertura de funciones del frontend supere el 36% exigido por las políticas de calidad.

### Decisiones

- Se establece el diseño Bento Grid y el soporte nativo de tema claro/oscuro como estándar visual definitivo de la aplicación.
- El avance y seguimiento de tareas se sincroniza activamente a través del tablero de GitHub Projects y la documentación en `docs/`.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Coordinar la integración de ramas de diseño y avanzar en la segregación de roles | Todo el equipo | 2026-10-09 |
| Reforzar la suite de pruebas E2E ante los nuevos cambios visuales | Equipo de testing | 2026-10-09 |

### Pendientes de la reunión anterior

- Puesta al día de todos los integrantes con la base de datos de Supabase: completada.

## 2026-10-08 (Mañana) — Puesta al día de la migración a PostgreSQL y estabilización de interfaz

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión sincrónica de sincronización técnica y distribución de tareas.

### Temas tratados

- **Sincronización de entornos de desarrollo locales:** Cada integrante actualizó su copia local mediante `git pull` sobre `main`, ejecutó `npm ci`, completó su archivo `.env` con la cadena de conexión de Supabase y verificó el acceso con `npm run db:probar`.
- **Gestión centralizada de accesos a la base de datos:** Se coordinó la provisión de accesos para todos los miembros del equipo al panel de administración de Supabase.
- **Estabilización de mejoras visuales del frontend (PR #58):** El equipo trabajó de manera colaborativa sobre la rama `feat/frontend-mejoras-visuales` para reintegrar componentes clave de interfaz (barra superior con menús desplegables, formularios, avatares y visor de imágenes), corrigiendo conjuntamente el orden de hooks en `UsuarioDetalle` y el desborde responsivo a 375 px para asegurar que pasen todos los checks del CI.
- **Centralización y consolidación de minutas:** Se recopilaron y unificaron en el canal común las minutas de reuniones y acuerdos técnicos previos para consolidar el registro histórico de seguimiento del proyecto.

### Decisiones

- La nueva interfaz se integra de forma permanente en `main` tras verificar que pasan satisfactoriamente lint, build, pruebas unitarias y E2E.
- Se adopta la barra superior flotante organizada en cuatro menús contextuales: Juego, Personajes, Catálogo y Sistema.
- **Seguridad y confidencialidad:** Se acordó rotar contraseñas de la base de datos y evitar compartir credenciales o secretos por canales abiertos de chat, manteniéndolas en variables de entorno locales.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Rotar contraseñas de la base de datos de Supabase y actualizar secretos | Equipo de infraestructura | Antes de la entrega |
| Formalizar y documentar el marco metodológico y seguimiento de tareas | Todo el equipo | 2026-10-08 (Tarde) |
| Desarrollar el soporte de tema oscuro y claro con pruebas unitarias | Equipo de frontend | 2026-10-08 (Tarde) |

### Pendientes de la reunión anterior

- Evaluación de la latencia y rendimiento de las consultas hacia Supabase: se mantiene bajo monitoreo.

## 2026-10-07 — Migración de persistencia a PostgreSQL (Supabase) y estrategia de integración continua

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión técnica de evaluación arquitectónica y resolución de contingencias.

### Temas tratados

- **Debate técnico sobre infraestructura de persistencia:** El equipo evaluó la transición técnica de MySQL (`@mikro-orm/mysql`) hacia PostgreSQL en Supabase, sopesando alternativas en la nube (Aiven, Railway, Render, Vercel, Netlify). Se consensuó avanzar de manera definitiva con Supabase y PostgreSQL para contar con una base de datos administrada y accesible para todo el equipo sin depender de servidores locales.
- **Ejecución coordinada de la migración (PR #54):** Se adaptó el backend a PostgreSQL utilizando `@mikro-orm/postgresql`, implementando la consulta paralela de usuarios y roles, configurando pruebas de integración y E2E sobre esquemas temporales aislados, e incorporando los scripts `db:rls` y `db:probar` junto con la defensa CSRF.
- **Guía de actualización para el equipo:** Se elaboró y publicó `TUTORIAL.md` en la raíz del repositorio detallando los pasos para que todos los integrantes configuren sus entornos locales con Supabase (PR #57).
- **Control de estabilidad en CI (PR #55):** Ante fallas de lint y E2E provocadas por desajustes visuales, el equipo resolvió coordinadamente revertir de forma preventiva las modificaciones de interfaz para preservar la estabilidad de `main`, preservándolas en una rama de trabajo para resolver las inconsistencias en conjunto.
- **Preparación de datos de prueba y diseño de perfiles:** Se coordinó la carga estandarizada de datos de demostración mediante `npm run demo:datos`, y se consensuó usar la letra inicial en avatares de reemplazo para evitar desbordes visuales.
- **Monitoreo y aprobación de ajustes de CI:** Se revisaron y aprobaron PRs de corrección en flujos de integración continua (#51, #53, #56).

### Decisiones

- Supabase (PostgreSQL) se establece como la base de datos compartida y oficial del proyecto.
- Se prioriza la estabilización del pipeline de CI: ningún cambio de frontend puede ingresar a `main` sin tener los tres checks (lint, build y tests) en verde.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Sincronizar copias locales (`git pull`, `npm ci`, `.env` y `npm run db:probar`) | Todo el equipo | 2026-10-08 |
| Estabilizar y corregir inconsistencias en la rama de mejoras visuales | Equipo de frontend | 2026-10-08 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-09-22 — Ensayo general y coordinación de la presentación del proyecto

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Ensayo sincrónico y calibración de exposición grupal.

### Temas tratados

- **Ensayo general y cronometrado grupal:** El equipo realizó un ensayo completo de la presentación evaluando los tiempos de exposición por bloque (promediando entre 2 y 4 minutos por sección), asegurando que la duración total se encuadre en el límite estipulado por la cátedra.
- **Revisión de temas y complementariedad:** Se repasó la articulación entre los distintos ejes conceptuales asignados para garantizar transiciones fluidas durante la disertación.
- **Planificación de la demostración práctica en vivo:** Se acordó que la demostración del sistema en funcionamiento se realice de punta a punta desde la interfaz del frontend, cubriendo los casos de uso principales.
- **Revisión del prototipo interactivo:** Se examinó de forma colaborativa el prototipo interactivo en Marvel para complementar la exposición teórica.

### Decisiones

- Mantener los tiempos de exposición calibrados en el ensayo para garantizar una presentación equilibrada.
- Realizar la demostración práctica del sistema en vivo operando directamente sobre la interfaz de usuario en el frontend.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Preparar y ensayar la demostración práctica en vivo de los flujos de usuario | Equipo de demostración | Día de la presentación |

### Pendientes de la reunión anterior

- Presentación ante la cátedra: programada conforme al calendario.

## 2026-08-12 — Presentación de la prueba de concepto, suite E2E y base de datos compartida

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión técnica y organizativa.

### Temas tratados

- **Adopción de pruebas de extremo a extremo (E2E):** El equipo analizó e incorporó Playwright para las pruebas E2E, documentando los comandos de ejecución colaborativa (`npm run dev` y `npm run test:e2e -- --ui`) y definiendo los flujos críticos a testear.
- **Distribución equitativa de temas de exposición:** Se acordó el reparto balanceado de los temas de la prueba de concepto para la presentación grupal, abarcando conceptos de arquitectura en capas, ecosistema, adopción, consideraciones operativas y demostración en vivo de código.
- **Pruebas de conectividad a base de datos compartida:** Se llevaron a cabo pruebas conjuntas de conexión hacia el servidor de base de datos compartido, diagnosticando errores de acceso y consensuando la reconfiguración de permisos para todos los integrantes.
- **Sincronización y revisión de pull requests:** El equipo revisó los PRs pendientes, acordó mantener limpio el árbol del repositorio y reforzó buenas prácticas para la publicación y sincronización de ramas de trabajo (`git push -u origin <rama>`).

### Decisiones

- Las pruebas de extremo a extremo se desarrollarán de manera oficial con Playwright.
- Todo desarrollo nuevo debe integrarse mediante pull request con revisión compartida.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Ensayar y afinar cada sección de la presentación | Todo el equipo | Día de la presentación |
| Verificar la publicación y sincronización de ramas de trabajo | Todo el equipo | 2026-08-12 |

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
- **Revisión colaborativa de controladores (PR #12):** Se validó la corrección en el controlador de usuarios, asegurando la conversión numérica estricta mediante `parseInt` y la validación adecuada de identificadores en rutas.
- **Estandarización del comando de inicio:** Se acordó y documentó el comando unificado `npm run dev` para levantar el entorno de desarrollo local de manera homogénea en todos los puestos de trabajo.

### Decisiones

- El nuevo diagrama entidad-relación (`DER_NEW.png`) constituye la referencia oficial del modelo de datos.
- Se adopta `npm run dev` como script estándar para desarrollo local.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar y expandir la API de usuarios con sus rutas asociadas | Equipo de backend | 2026-08-12 |

### Pendientes de la reunión anterior

- Servidor Express (PR #9) y alineación con directivas de la cátedra (PR #10): resueltos favorablemente.

## 2026-07-17 — Definición de arquitectura en capas, stack MikroORM y esquema de persistencia

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Reunión de diagnóstico técnico y diseño arquitectónico.

### Temas tratados

- **Diagnóstico del estado del proyecto:** El equipo analizó en conjunto la situación del prototipo inicial (el cual operaba con datos en memoria) y definió los requerimientos estructurales exigidos por la cátedra: API REST con Express en arquitectura en capas, persistencia profesional con MikroORM, configuración protegida mediante `.env`, autenticación en dos niveles (jugador y anfitrión) con protección de rutas y pruebas automatizadas.
- **Estrategia de desarrollo vertical testigo:** Se acordó implementar como molde arquitectónico completo el CRUD de Usuario de punta a punta: React → fetch → Express → Service → MikroORM → MySQL, de modo que sirva como plantilla reproducible para las demás entidades.
- **Configuración de dependencias y paquetes:** Se instalaron y configuraron colaborativamente `@mikro-orm/core@6`, `@mikro-orm/mysql@6`, `dotenv` y `tsx`, resolviendo incompatibilidades de versiones.
- **Definición de estructura y variables de entorno:** Se consensuó la distribución de paquetes en capas (`entities`, `services`, `controllers`, `routes`) y se definieron las variables requeridas en `.env`.
- **Creación de tablas y datos iniciales:** Se ejecutaron pruebas de creación de esquemas (`npm run schema:create`) y se cargaron de forma colaborativa las clases de D&D y los datos de prueba de usuarios y jugadores, consolidando el script integral `CREATE TABLE`.

### Decisiones

- Desarrollar la entidad Usuario de extremo a extremo como modelo testigo para las demás entidades.
- Implementar la persistencia mediante MikroORM protegiendo todas las credenciales mediante variables de entorno.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Implementar el esqueleto base en capas (Express, MikroORM, `.env`) | Equipo de backend | 2026-07-24 |
| Desarrollar las entidades restantes del modelo relacional | Equipo de backend | 2026-07-24 |
| Consolidar datos de prueba y clases de personajes | Equipo de datos | 2026-07-24 |

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
| Sincronizar e integrar el nuevo modelo de interfaces en el repositorio | Equipo | 2026-07-13 (completado) |

### Pendientes de la reunión anterior

- Definición del esquema relacional: completada el 10/07.

## 2026-07-10 — Consolidación del esquema relacional y adopción de stack tecnológico

- **Participantes:** Franco Testi, Renzo Scollo, Alejandro Ciesco, Octavio Gudiño, Emanuel Salomón.
- **Modalidad:** Mesa de diseño de persistencia y consenso de arquitectura.

### Temas tratados

- **Diseño del esquema de base de datos:** El equipo estructuró y consensuó el esquema relacional con sus claves primarias y foráneas para las 12 entidades del dominio: Usuario, Jugador, Anfitrion, Partida, Sesion, Mision, Clase, Tienda, Personaje, Inventario, Personaje_Sesion y Objeto.
- **Elección del stack de persistencia:** Tras analizar diversas alternativas técnicas, se acordó por unanimidad la adopción de MySQL junto con MikroORM como tecnología de mapeo objeto-relacional (ORM).
- **Conectividad inicial a base de datos:** Se estructuró el archivo `db.ts`, se incorporó `mysql2` y se llevaron a cabo pruebas conjuntas de acceso a una instancia compartida de base de datos para validar la conectividad grupal.

### Decisiones

- Se define el stack tecnológico de persistencia: MySQL + MikroORM.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Definir las interfaces TypeScript del esquema relacional | Equipo de modelado | 2026-07-13 |
| Implementar módulos de conexión `db.ts` y servicios iniciales | Equipo de backend | 2026-07-13 |

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
  - `Partida`: inicialización, avance secuencial de turnos y desvinculación de jugadores.
  - `Personaje`: equipamiento y desequipamiento de objetos con validación de nivel y sustitución automática de ítems.
  - `Tienda`: flujos transaccionales de compra y venta de objetos.
  - `Jugador` / `Anfitrion`: unión a partidas y administración de participantes.
  - `Sesion`: registro cronológico de acciones y eventos de la partida.
- **Desarrollo colaborativo de operaciones comerciales:** Se definieron y programaron en equipo las funciones `buscarObjeto`, `iniciarVenta`, `venderObjeto` y `comprarObjeto`, estableciendo el cálculo de monedas de oro y el factor de reventa.

### Decisiones

- La venta de un objeto acredita dinero al personaje según el factor de reventa y reintegra el ítem a la disponibilidad de la tienda.
- Equipar un objeto requiere obligatoriamente que el nivel del personaje sea igual o superior al nivel exigido por el objeto.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Implementar y verificar métodos de la clase `Sesion` | Equipo de lógica | 2026-05-15 |
| Desarrollar lógica de equipamiento y desvinculación de jugadores | Equipo de lógica | 2026-05-15 |
| Completar lógica transaccional de compra y venta | Equipo de comercio | 2026-05-15 |

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
