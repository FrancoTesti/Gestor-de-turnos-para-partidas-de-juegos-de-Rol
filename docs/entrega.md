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

Los servicios de usuarios, jugadores y partidas ya utilizan `api.ts`. Una búsqueda de `fetch(` en `frontend/src` encuentra únicamente el cliente común. Después de la migración, la compilación del frontend y sus 34 pruebas aprobaron. Sigue pendiente comprobar y resolver la expiración global de sesión.
