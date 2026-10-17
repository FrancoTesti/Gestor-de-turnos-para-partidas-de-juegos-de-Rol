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

| Integrante | Módulo |
| --- | --- |
| Franco Testi | Líder de Proyecto, Backend Core (`Express`/`MikroORM`), partidas, sesiones, misiones, calificación y despliegue en Render |
| Octavio Alejandro Gudiño | Motor de Economía, tiendas, objetos únicos y comunes clonados, inventarios, compra/venta y bloqueos pesimistas |
| Emanuel Salomón | Seguridad y criptografía (`scrypt`, cookies `HttpOnly`), usuarios, perfiles, migración a PostgreSQL (Supabase) y documentación de entrega |
| Alejandro Mario Ciesco | Clases, creación atómica de personajes e inventario base #1, reglas de nivel/cupos y acceso a partidas |
| Renzo Scollo | Frontend SPA (`UserContext`, cliente HTTP `api.ts`), responsive, accesibilidad WCAG 2 AA, pruebas unitarias/integración/E2E y CI/CD |
