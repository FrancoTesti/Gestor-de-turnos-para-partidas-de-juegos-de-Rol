# Metodología de trabajo

Documento que pide la cátedra: tipo de metodología usada para el seguimiento, cómo se registra el
avance y qué herramienta se usa para el trackeo.

> **Aclaración.** El equipo no eligió una metodología formal al empezar el proyecto. La que se declara
> acá es la que mejor describe cómo se trabajó en la práctica, y se adopta de forma explícita desde
> el cierre de la entrega para ordenar el registro.

## Metodología adoptada: Scrum adaptado, con tablero Kanban

Se eligió Scrum porque es lo más parecido a lo que el equipo hizo: avanzar por iteraciones cortas,
reunirse a repartir y revisar trabajo, y entregar incrementos que se integran al repositorio común.
No se aplica completo (no hay Scrum Master ni *daily* formal). Se toma de Scrum lo que ya se hacía y
se suma un tablero Kanban para ver el estado de cada tarea.

| Elemento de Scrum | Cómo se aplicó en este proyecto |
| --- | --- |
| *Product backlog* | La matriz CRUD y los requisitos de la cátedra, volcados en [entrega.md](entrega.md) y en las columnas *Backlog* del tablero. |
| *Sprint* (iteración) | Una semana, alineada con las clases de Desarrollo de Software. Las ramas de trabajo hablan de "iteración" (por ejemplo `ramaEmaIteracion4`). |
| *Sprint planning* | En la reunión semanal se reparten módulos y tareas (ver las asignaciones de cada entrada en [minutas.md](minutas.md)). |
| *Sprint review* | Al cerrar cada iteración se muestra lo hecho y se prueba junto en la reunión, con las capturas y los recorridos de [pruebas_manuales.md](pruebas_manuales.md). |
| Incremento | Cada módulo llega a `main` por *pull request* con la integración continua en verde. |
| Roles | Un responsable por módulo (ver tabla de abajo). La coordinación general la lleva Franco, que es quien propone las agendas y organiza las llamadas. |
| *Daily* | No se hace. La comunicación diaria es asincrónica, por el chat del equipo. |

### Responsables por módulo

| Módulo | Responsable |
| --- | --- |
| Cuentas y perfiles | Emanuel Salomón |
| Clases, personajes y acceso a partidas | Alejandro Mario Ciesco |
| Objetos, tiendas, inventarios, compra y venta | Octavio Alejandro Gudiño |
| Partidas, sesiones, misiones y calificación | Franco Testi |
| Transversal: responsive, accesibilidad, pruebas E2E, CI | Renzo Scollo |

### Prácticas de ingeniería que se usan

Estas prácticas vienen de XP y complementan el marco anterior:

- **Ramas por funcionalidad y *pull request* a `main`.** Nadie trabaja directo sobre `main`.
- **Integración continua obligatoria.** Cada PR corre lint, compilación, pruebas unitarias, pruebas
  E2E y la verificación de enlaces de la documentación (`npm run docs:check`). No se fusiona con la
  integración en rojo; los PR #34, #52 y #55 existen justamente por haber dejado `main` roto.
- **Pruebas automáticas y manuales.** Ver [evidencia_tests.md](evidencia_tests.md) y
  [pruebas_manuales.md](pruebas_manuales.md).
- **Programación en pareja o grupal** con Live Share durante las reuniones.
- **Revisión por pares** en los PR, incluyendo los hallazgos del revisor automático.

## Seguimiento y registro

El registro del equipo tiene tres partes, como pide la cátedra:

1. **Metodología:** este documento.
2. **Minutas de reuniones:** [minutas.md](minutas.md), con temas, decisiones y asignaciones por
   reunión.
3. **Trackeo de features y bugfix, y asignación de tareas:** [trackeo.md](trackeo.md) (features,
   correcciones y quién las hizo, con el PR) y [seguimiento.md](seguimiento.md) (estado por módulo y
   registro de defectos).

## Herramienta de trackeo: GitHub Projects

El tablero vive en **GitHub Projects**, integrado al repositorio
`FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol`.

**Enlace al tablero:** [https://github.com/users/FrancoTesti/projects/1](https://github.com/users/FrancoTesti/projects/1)

### Configuración del tablero

- **Vista:** tablero (Kanban) con las columnas de abajo.
- **Campos propios:** *Responsable* (usuario asignado), *Módulo* (los cinco de la tabla de arriba),
  *Tipo* (`feature`, `bugfix`, `docs`, `test`, `chore`) e *Iteración* (semana).

| Columna | Qué significa |
| --- | --- |
| Backlog | Pendiente, sin asignar o sin empezar. |
| En curso | Alguien lo está haciendo; tiene rama. |
| En revisión | Tiene PR abierto y espera revisión o integración continua. |
| Hecho | Fusionado en `main`. |

### Cómo se usa

1. Cada tarea es una *issue* con un título claro y el responsable asignado.
2. La issue se pasa a **En curso** al crear la rama y a **En revisión** al abrir el PR.
3. El PR cierra la issue con `Closes #N` en la descripción; al fusionar pasa sola a **Hecho**.
4. Los defectos se anotan también en [seguimiento.md](seguimiento.md).

### Definición de hecho

Una tarea está hecha cuando:

- El PR pasa lint, compilación, pruebas unitarias, E2E y `docs:check`.
- Otro integrante revisó el cambio.
- La documentación afectada está actualizada.
