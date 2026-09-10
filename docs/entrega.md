# Seguimiento de cierre del TP

Base de trabajo: `f1a7dfd`, sincronizada desde el repositorio original al fork de Renzo Scollo el 9 de septiembre de 2026. Rama de implementación: `entrega/completar-tp`.

Este archivo registra el cierre de la entrega. Una tarea pendiente no se considera cumplida por la sola presencia de código o por un informe anterior.

## Requisitos y evidencia pendiente

| Área | Trabajo para cerrar | Evidencia necesaria |
| --- | --- | --- |
| Requisitos | Contrastar propuesta, documento del grupo y condiciones vigentes de la cátedra | Matriz requisito → implementación → prueba |
| Comunicación HTTP | Unificar clientes y gestionar expiración de sesión | Pruebas de errores y sesión; recorrido en navegador |
| Funcionalidad | Auditar todos los CRUD, filtros y casos de uso | Pruebas por requisito y por rol |
| Objeto único | Precisar alcance e incorporar dato requerido | Persistencia, DTO, interfaz y pruebas |
| Frontend | Resolver advertencias, accesibilidad y presentación responsive | Lint y revisión en tamaños pequeño, medio y grande |
| E2E | Ejecutar flujo real desde navegador con backend y MySQL | Suite reproducible y resultado guardado |
| CI | Automatizar frontend, backend y MySQL | Ejecución verde en Actions del fork |
| Documentación | Actualizar propuesta, modelo, API e índice | Enlaces válidos e instalación comprobada |
| Demostración | Preparar datos, guion, video y despliegue según alcance | Artefactos reales, sin credenciales privadas |

## Automatización

`.github/workflows/verificacion.yml` ejecuta compilación, tests y lint del frontend, además de compilación, tests unitarios e integración MySQL del backend. La base del servicio CI es efímera; la suite crea y elimina exclusivamente su propia base aleatoria. La contraseña declarada en el workflow pertenece solo a ese servicio de prueba.

La primera ejecución remota aprobó ambos trabajos: [Actions 34419939705](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/34419939705). La automatización todavía no incluye E2E.

## Comunicación HTTP

Los servicios de usuarios, jugadores y partidas ya utilizan `api.ts`. Una búsqueda de `fetch(` en `frontend/src` encuentra únicamente el cliente común.

Una respuesta protegida `401` notifica al contexto, que limpia identidad, usuarios y perfiles. El layout protegido existente redirige al login al perder la identidad. Un rechazo de contraseña al iniciar sesión no dispara esa notificación. Las recargas de listas iniciadas antes de limpiar la sesión no vuelven a introducir datos privados.

El cliente también identifica errores de conexión sin reintentar escrituras, admite respuestas `204` y conserva el estado HTTP ante cuerpos de error inesperados. Compilación y 39 pruebas del frontend aprobadas; lint sin errores, con tres advertencias previas. La prueba de contexto verifica limpieza de identidad y listas ante un `401` del cliente real; falta comprobar la navegación completa en E2E.
