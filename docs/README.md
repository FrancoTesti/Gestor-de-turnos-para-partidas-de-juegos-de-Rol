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
| [plantilla_crud_usuario.md](plantilla_crud_usuario.md) | Cómo está armado un módulo CRUD, capa por capa |
| [PasajeATabla.txt](PasajeATabla.txt) | Pasaje del modelo conceptual a tablas |

## Para probar y entregar

| Documento | Para qué |
| --- | --- |
| [pruebas_manuales.md](pruebas_manuales.md) | Checklist manual y qué cubre cada suite automática |
| [evidencia_tests.md](evidencia_tests.md) | Resultado real de cada suite automática y cómo reproducirla |
| [evidencia_calidad_visual.md](evidencia_calidad_visual.md) | Revisión responsive y de accesibilidad, con hallazgos y correcciones |
| [evidencia_responsive_revision.md](evidencia_responsive_revision.md) | Revisión humana de las capturas en los tres tamaños |
| [demo.md](demo.md) | Guion de la demostración e instrucciones para grabar el video |
| [entrega.md](entrega.md) | Estado de la entrega, evidencias de build/tests y enlaces a los PR |
| [verificacion_renzo.md](verificacion_renzo.md) | Verificación del módulo de usuarios y autenticación |

## Diagramas

- `DER_NEW.png` — diagrama entidad-relación vigente.
- `ModeloDominioOLD.drawio.png` — versión anterior, **desactualizada**. Se conserva como historial;
  la referencia válida es [modelo.md](modelo.md).

## Reparto del trabajo

| Integrante | Módulo |
| --- | --- |
| Renzo Scollo | Cliente HTTP del frontend, manejo de errores, pruebas E2E e integración continua |
| Franco Testi | Partidas, sesiones, misiones y calificación del anfitrión |
| Alejandro Mario Ciesco | Clases, personajes y acceso a partidas |
| Octavio Alejandro Gudiño | Objetos, tiendas, inventarios, compra y venta |
| Emanuel Salomón | Usuarios, perfiles, documentación y preparación de la entrega |
