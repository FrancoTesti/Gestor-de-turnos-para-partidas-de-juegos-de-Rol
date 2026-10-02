# Minutas de reunión

Registro de avances que pide la cátedra: una entrada por reunión, de la más nueva a la más vieja.
Cada minuta la escribe alguien que estuvo en la reunión, el mismo día. Los defectos que surjan se
anotan también en [seguimiento.md](seguimiento.md).

## Plantilla

Copiar este bloque arriba de la última minuta y completarlo.

```markdown
## AAAA-MM-DD — Tema de la reunión

- **Participantes:** …
- **Ausentes:** …
- **Medio:** presencial / Discord / Meet …

### Temas tratados

- …

### Decisiones

- …

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| … | … | … |

### Pendientes de la reunión anterior

- …
```

## Minutas

Ordenadas de la más reciente a la más antigua. En todas participó el grupo completo (Octavio
Gudiño, Emanuel Salomón, Renzo Scollo, Franco Testi y Alejandro Ciesco), salvo que se indique otra
cosa. «No registrado» significa que el dato no se anotó en su momento y no se reconstruyó después.

## 2026-10-01 — Última entrega del TP

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Última entrega del trabajo práctico. En la última iteración se trabajó sobre las minutas y el video.

## 2026-09-22 — Muestra de cada parte para la presentación en clase

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se hace una muestra de cada una de las partes del sistema. Cada integrante dispone de 3 minutos,
  para ajustarse al tiempo total.

### Decisiones

- La presentación en clase es el 25 de septiembre.

## 2026-08-12 — Proof of Concept: propuesta y reparto

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Franco propone cuál será la Proof of Concept: la muestra del sistema en vivo y en directo,
  depurando la fase alfa del sitio web.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Minuta con las partes que presenta cada uno (parcial, entre 2 y 3 páginas) | Emanuel | No registrado |

## 2026-08-08 — Guion y slides de la Proof of Concept

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se genera el guion y las slides de la Proof of Concept, una vez elegido Playwright.

## 2026-07-24 — Elección del tema de la Proof of Concept

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Decisiones

- Se elige el tema de la Proof of Concept.

## 2026-07-17 — Datos de prueba y diccionario de datos

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se pueblan con datos de prueba todas las tablas.
- Se arma el diccionario de datos de cada tabla con sus dominios. Ejemplo de la tabla `Partida`:
  `idPartida INT NOT NULL`, `nombre VARCHAR(50)`, `estado VARCHAR(50)`, `limiteJugadores INT`,
  `contraseña VARCHAR(50)`, `idUsuario_Anfitrion INT NOT NULL`, con clave primaria `idPartida` y
  clave foránea hacia `Anfitrion(idUsuario)`.

### Decisiones

- Desde esta fecha se trabaja en paralelo, con fases de implementación semanales (ver
  «Modalidad de trabajo» más abajo).

## 2026-07-15 — Base de datos compartida y arranque del proyecto

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Alejandro aloja la base de datos en un puerto local. Todos se conectan y hacen cambios en
  simultáneo.
- Las tablas empiezan a poblarse.
- Se ejecutan los comandos de inicialización de npm. El grupo empieza a entender cómo ensamblar
  frontend y backend para desarrollar pruebas.

## 2026-07-13 — Interfaces y comienzo de la API

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se actualiza el `.tsx` para mantenerlo alineado con la base de datos.
- Se implementan las interfaces: cada entidad de negocio, sin sus métodos.
- Se comienza la API con los servicios, siguiendo la arquitectura MVC.

## 2026-07-10 — Diagrama entidad-relación

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Con el Modelo de Dominio y las cardinalidades se piensa el diagrama entidad-relación, con tablas
  intermedias.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Diagrama entidad-relación | Franco y Alejandro | No registrado |
| Implementar cada uno de los atributos | Emanuel | No registrado |
| Depurar los métodos de las clases | Octavio y Renzo | No registrado |

## 2026-07-08 — Base de datos para la persistencia

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se sigue desarrollando `App.tsx`.
- Se empieza a trabajar en la base de datos para lograr persistencia.

## 2026-07-06 — Se retoma la programación

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se implementan funcionalidades en `App.tsx` para mostrar los datos sin persistencia.
- Se toman conceptos de Entornos Gráficos (electiva de la UTN) para pensar un frontend con buena UI.

## Mayo a junio de 2026 — Pausa y cambio a TypeScript

No hubo reuniones de trabajo en estos dos meses: coincidieron los primeros parciales y las clases
teóricas de Desarrollo de Software.

### Decisiones

- Al retomar, se prioriza cambiar de JavaScript a TypeScript, por los tipos y para tener código más
  limpio.

## 2026-05-08 — Diagrama de clases de diseño

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se implementa el Diagrama de Clases de Diseño, con algunos métodos.
- Se divide el trabajo de programación de cada uno de los métodos.
- Se comparten las implementaciones para integrarlas en el sistema.
- Se usan las funciones de iteración sobre arreglos de JavaScript para simular la base de datos.

## 2026-05-01 — Programación en paralelo y tema del juego

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se programa en paralelo con Visual Studio Code; cada integrante instala Node.
- Se habla del concepto de «Dungeons & Dragons» y de cómo se procederá con las clases.
- Se debate cómo conseguir el correo académico para tener acceso a GitHub Pro.

## 2026-04-17 — Modelo de Dominio y casos de uso

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Franco cuenta el resumen de su clase con Joel, para encarar el modelo de datos a partir del Mapa
  Conceptual.
- Se empiezan a pensar casos de uso para cada una de las clases.

### Decisiones

- Se define el Modelo de Dominio.

## 2026-04-10 — CRUD y modelado de datos

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- Se hace el Docs con el CRUD.
- Se empieza a ver el modelado de datos en un Mapa Conceptual.

### Decisiones

- Se definen las clases mínimas para la aprobación directa, sin consideraciones de normalización
  (el grupo todavía no tenía conocimientos de Bases de Datos).

## 2026-04-03 — Ideas para el trabajo práctico

- **Participantes:** Todo el grupo
- **Medio:** No registrado

### Temas tratados

- El grupo discute ideas posibles para el trabajo práctico y estudia los requerimientos de la
  cátedra.
- Se consulta el repositorio de la cátedra, se estudia la matriz CRUD y se repasa el concepto de CRUD.

### Decisiones

- En la primera iteración se va por la regularidad.
- El sistema se construye por iteraciones, con una modalidad afín al Proceso Unificado de Larman.

## Modalidad de trabajo

Desde el 17 de julio se trabaja en paralelo con fases de implementación semanales: cinco jueves
distintos, con la primera entrega que tomó dos semanas y el resto cada jueves.

El objetivo fue repartir las tareas de manera uniforme y aprovechar el repositorio de GitHub para
trabajar en paralelo con git. Según el registro del grupo, esto permitió implementar todos los casos
de uso de regularidad y de aprobación directa, que todos tuvieran la misma carga y que hubiera un
avance cuantificable cada semana.
