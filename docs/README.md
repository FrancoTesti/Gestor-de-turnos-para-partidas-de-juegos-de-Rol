# Documentación del proyecto

Índice de todo lo que hay que leer para instalar, entender, probar y demostrar el sistema.
Si algo no está acá, no está documentado: conviene agregarlo antes de la entrega.

## Para empezar

| Documento | Para qué |
| --- | --- |
| [instalacion.md](instalacion.md) | Requisitos, dependencias, creación de la base, `.env`, arranque y problemas frecuentes |
| [../README.md](../README.md) | Resumen del proyecto y tabla de comandos |
| [despliegue.md](despliegue.md) | Variables de entorno y qué haría falta para publicarlo |

## Para entender el sistema

| Documento | Para qué |
| --- | --- |
| [modelo.md](modelo.md) | Modelo de datos vigente, entidad por entidad, con el diagrama actualizado |
| [funcionalidad.md](funcionalidad.md) | Reglas de negocio y permisos implementados |
| [api.md](api.md) | Endpoints con cuerpos, respuestas y errores |

## Para probar y entregar

| Documento | Para qué |
| --- | --- |
| [pruebas_manuales.md](pruebas_manuales.md) | Checklist manual y qué cubre cada suite automática |
| [evidencia_tests.md](evidencia_tests.md) | Resultado real de cada suite automática y cómo reproducirla |
| [evidencia_calidad_visual.md](evidencia_calidad_visual.md) | Revisión responsive y de accesibilidad, con hallazgos y correcciones |
| [evidencia_responsive_revision.md](evidencia_responsive_revision.md) | Revisión humana de las capturas en los tres tamaños |
| [demo.md](demo.md) | Guion de la demostración, datos de demo (`npm run demo:datos`) e instrucciones para grabar el video |
| [respaldo.md](respaldo.md) | Copia de seguridad y restauración de la base antes de una demo o un ensayo |
| [entrega.md](entrega.md) | Estado de la entrega, evidencias de build/tests y enlaces a los PR |
| [seguimiento.md](seguimiento.md) | Estado por módulo y registro de defectos con el PR que los resuelve |
| [minutas.md](minutas.md) | Minutas de reunión: fecha, participantes, decisiones y asignaciones |
| [metodologia.md](metodologia.md) | Metodología de trabajo (Scrum adaptado) y herramienta de trackeo (GitHub Projects) |
| [trackeo.md](trackeo.md) | Funcionalidades y correcciones por módulo, con responsable y PR |
| [verificacion_usuarios_auth.md](verificacion_usuarios_auth.md) | Verificación del módulo de usuarios y autenticación |
| [verificacion_clases_personajes.md](verificacion_clases_personajes.md) | Verificación del módulo de clases, personajes y partidas |

## Diagramas

- `DER_NEW.png` — diagrama entidad-relación vigente; la referencia detallada está en [modelo.md](modelo.md).

## Reparto del trabajo

| Integrante | Área | Módulo y alcance asignado |
| --- | --- | --- |
| Alejandro Mario Ciesco | **Backend** | Modelado de datos relacional (`src/entities/`, `SQL/rpg.sql`, `mikro-orm.config.ts`) y módulos completos de **Clases**, **Tiendas** y **Personajes** (DTOs, validadores, servicios, controladores, rutas y tests unitarios) |
| Emanuel Salomón | **Backend** | Núcleo Express (`src/app.ts`), seguridad y criptografía (`scrypt`, `timingSafeEqual`, cookies `HttpOnly`, CSRF, `authorization.ts`), módulos de **Usuarios**, **Jugadores** y **Anfitriones**, migración a Supabase y scripts |
| Franco Testi | **Backend** | Líder de Proyecto y motor transaccional: módulos de **Partidas**, **Sesiones**, **Misiones**, **Karma**, **Inventarios** y **Objetos/Comercio** (`match.service.ts`, `game.service.ts`, `item.service.ts`), bloqueos pesimistas, integración en PostgreSQL y despliegue en Render |
| Renzo Scollo | **Frontend** | Arquitectura React SPA (`App.tsx`, `UserContext`, `ThemeContext`, `MainLayout`), cliente HTTP (`api.ts`), biblioteca UI (`components/ui/`), pantallas de **Login/Registro/Perfiles/Usuarios**, flujo de **Partidas, Sesiones y Misiones**, accesibilidad WCAG 2 AA, tests E2E y CI/CD |
| Octavio Alejandro Gudiño | **Frontend** | Contratos TypeScript (`interfaces.ts`), servicios cliente de dominio y pantallas/componentes de **Personajes**, **Clases**, **Tiendas**, **Objetos (Compra y Venta)**, **Gestor de Inventarios** (`ModulePage.tsx`) y pruebas unitarias de interfaz |

