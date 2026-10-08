# Minutas de reunión

> Reconstruidas a partir del canal de chat del equipo y del historial de commits y PR del repositorio.

## Equipo

| Persona | Áreas principales según el historial |
| --- | --- |
| Franco Testi | Modelo de dominio, base de datos, CRUD de clases/objetos/tiendas, sesiones y misiones, estilos |
| Renzo Scollo | Backend en capas, entidades MikroORM, objetos y compra, autenticación, tests, CI y E2E |
| Alejandro Ciesco | Módulos de clases y personajes, acceso a partidas |
| Octavio Gudino | Sesiones, usuarios, comercio e inventarios |
| Emanuel | Cuentas y perfiles, documentación de entrega, migración a PostgreSQL (Supabase) |

## Minutas

<!-- Agregar las minutas acá, la más reciente primero. -->

## 2026-10-08 — Puesta al día de la migración y reincorporación del frontend de Franco

- **Participantes:** Emanuel, Franco, Renzo, Alejandro (según el registro del día).
- **Ausentes:** Octavio no tuvo participación registrada ese día.

### Temas tratados

- Cada integrante actualiza su copia: `git pull` en `main`, `npm ci`, completar el `.env` con la
  conexión a Supabase y comprobar con `npm run db:probar`.
- Emanuel pide los mails de todos para darles acceso al panel de Supabase; Franco envía el suyo.
- Se reincorporan las mejoras visuales de Franco (barra superior con menús desplegables, formularios,
  avatares, visor de imágenes) que se habían deshecho el 2026-10-07 porque dejaban `main` en rojo.
  Se trabajan sobre la rama `feat/frontend-mejoras-visuales`, con corrección del orden de hooks en
  `UsuarioDetalle` y del desborde de la barra a 375 px.
- La rama se integra a `main` por el PR #58.
- Emanuel pega en el chat del equipo las minutas de las reuniones del 03/04 y 10/04 que ya tenía escritas, para
  armar este registro.

### Decisiones

- El frontend de Franco queda en `main` una vez que pasan lint, build, tests unitarios y E2E.
- La barra lateral vertical se reemplaza por la barra superior con cuatro menús: Juego, Personajes,
  Catálogo y Sistema.
- **Seguridad:** durante el 07 y 08/10 la cadena de conexión y otras credenciales se pegaron en el
  chat. Deben rotarse las contraseñas y pasar a compartir secretos solo por mensaje privado.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Rotar la contraseña de la base de Supabase y las credenciales que circularon por el chat | Emanuel | Antes de la entrega |
| Dar acceso a Supabase a quienes enviaron su mail | Emanuel | Inmediato |
| Revisar y completar estas minutas | Cada responsable | Antes de la entrega |

### Pendientes de la reunión anterior

- Evaluar una región de Supabase más cercana (cada consulta tarda unos 190 ms hasta Canadá): sigue abierto.

## 2026-10-07 — Migración a PostgreSQL (Supabase) y deshacer cambios de frontend

- **Participantes:** Emanuel, Franco, Alejandro, Renzo.
- **Ausentes:** Octavio (sin participación registrada ese día).

### Temas tratados

- Franco advierte que Supabase usa PostgreSQL y el backend estaba armado para MySQL
  (`@mikro-orm/mysql`); propone como alternativa un MySQL en la nube (Aiven o Railway) y alojar el
  backend en Render o Railway y el frontend en Vercel o Netlify. Quedó en discusión por estar cerca de
  la entrega.
- Emanuel hizo la migración: backend a PostgreSQL con `@mikro-orm/postgresql`, consulta de usuario y
  roles en paralelo, pruebas de integración y E2E sobre un esquema temporal, scripts `db:rls` y
  `db:probar`, y corrección de la defensa CSRF. Todo entró a `main` por el PR #54.
- Se agregó `TUTORIAL.md` en la raíz con los pasos para ponerse al día (PR #57).
- Los cambios de frontend de Franco se revirtieron (PR #55) porque `main` quedó en rojo por lint y
  E2E; se conservaron en la rama `franco/mejoras-visuales`.
- Franco prepara los datos de demostración con `npm run demo:datos`.
- Emanuel observa que se podría usar la primera letra del nombre en el avatar de reemplazo para que no
  se salga del círculo.
- El agente de Copilot abrió PR de arreglo (#51, #53, #56) por fallas del CI.

### Decisiones

- Se adopta Supabase (PostgreSQL) como base compartida del equipo.
- Foco siguiente: depuración, aceleración de consultas y mejora visual del frontend.
- Los cambios de frontend entran solo por PR con los tres checks en verde.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| `git pull`, `npm ci`, completar `.env` y correr `npm run db:probar` | Todo el equipo | 2026-10-08 |
| Retomar `franco/mejoras-visuales` y arreglar las inconsistencias | Franco (con su agente) | 2026-10-08 |
| Evaluar un host de Supabase más cercano | Emanuel | 2026-10-08 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-09-22 — Ensayo de la presentación

- **Participantes:** Franco, Emanuel, Octavio, Alejandro, Renzo.
- **Ausentes:** —

### Temas tratados

- Ensayo de la presentación: cada integrante cronometró su parte (Franco 4 min, Octavio 3:30,
  Emanuel 3:05, Alejandro 2:00).
- Se repasa el reparto de puntos de la presentación (ver la entrada del 2026-08-12).
- Octavio recuerda que, en la parte práctica, Franco debe entrar por el frontend.
- Emanuel comparte un prototipo en Marvel.

### Decisiones

- Se mantienen los tiempos de exposición; cada uno ajusta su parte al tiempo cronometrado.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Demostración práctica entrando por el frontend | Franco | Día de la presentación |

### Pendientes de la reunión anterior

- Presentación en la cátedra (ver 2026-08-12).

## 2026-08-12 — Presentación de la prueba de concepto y base de datos compartida

- **Participantes:** Franco, Emanuel, Octavio, Alejandro, Renzo.
- **Ausentes:** —

### Temas tratados

- Uso de Playwright para pruebas E2E: Franco documentó los comandos (`npm run dev` y
  `npm run test:e2e -- --ui`) y explicó para qué se implementa.
- Reparto de los puntos del Excel de temas para la exposición: Renzo (5 y 7), Alejandro (comunidad y
  ecosistema, adopción masiva), Franco (11 y 12 en adelante), Octavio (2 y 3), Emanuel
  (consideraciones operativas y LLMs). Franco además muestra el código.
- Prueba de conexión contra el servidor de base de datos compartido de Alejandro: Emanuel recibió
  `Access denied` para su usuario.
- Franco pide actualizar el repositorio sin la parte de Node.js; se revisan los PR.
- Emanuel recuerda cómo subir una rama (`git push -u origin <rama>`) a Octavio, a quien le faltaba
  publicar la suya.

### Decisiones

- Se hacen las pruebas E2E con Playwright.
- Se registra la rama de cada uno por PR.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Preparar la parte de la presentación indicada arriba | Cada integrante | Día de la presentación |
| Publicar su rama en `origin` | Octavio | 2026-08-12 |

### Pendientes de la reunión anterior

- Diapositivas en Canva (opciones elegidas en la reunión del 08/08).

## 2026-08-08 — Preparación de la presentación

- **Participantes:** Franco, Renzo, Octavio, Alejandro, Emanuel (según el chat).
- **Ausentes:** Renzo se incorporó más tarde por un inconveniente con su equipo.

### Temas tratados

- Franco comparte el Excel de temas, el repositorio de la prueba de concepto de la cátedra
  (`utnfrrodsw/poc`) y plantillas de diapositivas de Canva.
- Se arma la presentación en Google Slides (la deja Renzo en el chat del equipo).
- Se organiza una carpeta compartida de Drive con el material.

### Decisiones

- Se usa Google Slides para la presentación.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Armar las diapositivas | Equipo | 2026-08-12 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-07-31 — Servidor Express en marcha y diagrama relacional

- **Participantes:** Franco, Renzo (según la actividad del repositorio).
- **Ausentes:** sin datos.

### Temas tratados

- Franco publica `DER_NEW.png` y archiva el modelo de dominio anterior como `ModeloDominioOLD`.
- Corrección en el controlador de usuarios: uso de `parseInt` y validación del id (PR #12).
- Franco deja asentado el comando para arrancar el servidor: `npm run dev`.

### Decisiones

- El diagrama entidad-relación nuevo reemplaza al anterior.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar el CRUD de usuarios con la API | Renzo | 2026-08-12 |

### Pendientes de la reunión anterior

- Servidor Express (PR #9) y alineación con el material de la cátedra (PR #10): resueltos.

## 2026-07-17 — Arquitectura en capas, MikroORM y creación de tablas

- **Participantes:** Franco, Renzo, Alejandro, Octavio, Emanuel.
- **Ausentes:** —

### Temas tratados

- Diagnóstico de Renzo del estado del proyecto: el frontend funcionaba con datos falsos en memoria, la
  conexión a MySQL andaba, pero no existía API. Faltaban lo que exige la cátedra: API REST con Express
  y arquitectura en capas, MikroORM, `.env` sin contraseñas fijas, autenticación con dos niveles
  (jugador y anfitrión) con protección de rutas, tests y los CRUD requeridos.
- Recomendación: empezar por un CRUD completo (Usuario) de punta a punta como molde:
  React → fetch → Express → Service → MikroORM → MySQL.
- Se instalan dependencias (`@mikro-orm/core@6`, `@mikro-orm/mysql@6`, `dotenv`, `tsx`) y se resuelven
  problemas de versiones de MikroORM.
- Franco detalla `.env` y estructura (`entities`, `services`, `controllers`, `routes`).
- Se prueban `npm run schema:create`, consultas SQL y se cargan datos de prueba: Alejandro propone las
  clases de personaje de D&D y escribe los `INSERT`, Emanuel carga usuarios y jugadores.
- Alejandro consolida el script `CREATE TABLE` del esquema.
- Se fijan los mensajes con las instrucciones de instalación.

### Decisiones

- Primer hito: Usuario completo de punta a punta; el resto de las entidades repite el patrón.
- El backend usa MikroORM con las credenciales en variables de entorno.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Esqueleto del backend en una rama (Express, MikroORM, `.env`, capas) | Renzo | 2026-07-24 |
| Entidades restantes del modelo relacional | Renzo | 2026-07-24 |
| Datos de prueba (clases, usuarios) | Alejandro y Emanuel | 2026-07-24 |

### Pendientes de la reunión anterior

- Subir el trabajo a GitHub (Emanuel lo hizo el 13/07).

## 2026-07-15 — Frontend y conexión a la base de datos

- **Participantes:** Franco, Renzo, Alejandro, Octavio, Emanuel.
- **Ausentes:** —

### Temas tratados

- Primera instalación del frontend del equipo (`cd frontend`, `npm install`) y prueba de que arranca.
- Pruebas de conexión a MySQL en el puerto 3306.
- Comparten las capturas de lo que ve cada uno y se acuerda el nombre del repositorio del equipo.
- Renzo sube la reestructuración del repo y el modelo unificado.

### Decisiones

- Todos trabajan sobre el repositorio de Franco.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Instalar y correr el frontend en cada máquina | Todo el equipo | 2026-07-17 |

### Pendientes de la reunión anterior

- Subir todo a GitHub: cumplido el 13/07.

## 2026-07-13 — Interfaces TypeScript y datos de prueba

- **Participantes:** Renzo, Emanuel, Franco.
- **Ausentes:** sin datos.

### Temas tratados

- Renzo creó `interfaces.ts` con las 12 interfaces del esquema, respetando claves foráneas como ids y
  la nulabilidad (por ejemplo, un objeto está en una tienda o en un inventario). Unificó el nombre
  `contrasena` (sin eñe ni tilde) para evitar problemas en bases de datos y código.
- Se ajustó `mockData.ts` para cumplir las interfaces; queda un usuario que es a la vez jugador y
  anfitrión (modelo con herencia de usuario).
- El código del modelo anterior (`TP_DSW.ts`) queda superado; se retirará más adelante.
- Emanuel sube todo al repositorio.

### Decisiones

- Se adopta el modelo con `Usuario` como entidad base de `Jugador` y `Anfitrion`.
- La contraseña se llama `contrasena` en todo el código.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Subir el código al repositorio | Emanuel | 2026-07-13 (hecho) |

### Pendientes de la reunión anterior

- Definir el modelo relacional (cerrado el 10/07).

## 2026-07-10 — Esquema relacional y elección de MySQL con MikroORM

- **Participantes:** Franco, Renzo, Emanuel, Alejandro, Octavio.
- **Ausentes:** —

### Temas tratados

- Franco redacta el esquema relacional con claves primarias y foráneas de las 12 tablas: Usuario,
  Jugador, Anfitrion, Partida, Sesion, Mision, Clase, Tienda, Personaje, Inventario, Personaje_Sesion
  y Objeto.
- Renzo propone MySQL con MikroORM como stack de persistencia.
- Franco empieza `db.ts` e instala `mysql2`; se prueba el acceso a la base compartida.
- Emanuel arma la base para que todos se conecten (las credenciales se compartieron por el chat).

### Decisiones

- Stack de persistencia: MySQL + MikroORM.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Interfaces TypeScript del esquema | Renzo | 2026-07-13 |
| `db.ts` y `apiServices.ts` | Franco | 2026-07-13 |

### Pendientes de la reunión anterior

- Revisar la propuesta final en `proposal.md` (hecho el 08/07).

## 2026-07-08 — Cierre de la propuesta

- **Participantes:** Franco, Octavio.
- **Ausentes:** sin datos.

### Temas tratados

- Se revisa y corrige la lista de integrantes y los detalles de `proposal.md` (commit de Octavio).
- Octavio comparte una captura de la entrega y Franco la da por buena.

### Decisiones

- La propuesta (`proposal.md`) queda como versión final del equipo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Modelo relacional | Franco | 2026-07-10 |

### Pendientes de la reunión anterior

- Revisión de documentos compartidos del 06/07.

## 2026-07-06 — Retomando el proyecto: clases en JavaScript y modelo de dominio

- **Participantes:** Franco, Alejandro, Octavio, Renzo, Emanuel.
- **Ausentes:** —

### Temas tratados

- Se repasan el modelo de dominio (`ModeloDominio.drawio.png`) y los documentos compartidos en Drive.
- Franco muestra el archivo `TP_DSW.js` con las clases de la lógica del juego.
- Emanuel comparte un repositorio de otra cátedra como referencia de estructura.
- Franco publica la grilla de cursada: lunes, miércoles y viernes Desarrollo de Software; martes,
  jueves y sábado C#.

### Decisiones

- Se sigue con el modelo de dominio vigente.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Cerrar `proposal.md` | Franco y Octavio | 2026-07-08 |

### Pendientes de la reunión anterior

- Implementar los métodos de las clases (reunión del 08/05).

## 2026-05-08 — Métodos de las clases del dominio

- **Participantes:** Franco, Emanuel, Octavio, Renzo, Alejandro.
- **Ausentes:** —

### Temas tratados

- Franco lista los métodos por clase: `Partida` (iniciar y avanzar turno, quitar jugador), `Personaje`
  (equipar y desequipar objeto), `Tienda` (comprar y vender objeto), `Jugador`/`Anfitrion` (unirse a
  partida, expulsar jugador) y `Sesion` (registrar acción).
- Se reparten las clases: `Partida` ya estaba hecha; `Sesion` la toma Octavio; Emanuel trabaja
  `removerJugador` y `equiparObjeto` (con validación de nivel y reemplazo del objeto equipado).
- Se escriben `buscarObjeto`, `iniciarVenta`, `venderObjeto` y `comprarObjeto`.

### Decisiones

- La venta devuelve el objeto a la tienda y el personaje recibe dinero con un factor de reventa.
- Equipar un objeto exige que el nivel del personaje alcance el nivel del objeto.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Clase `Sesion` | Octavio | 2026-05-15 |
| `removerJugador` y `equiparObjeto` | Emanuel | 2026-05-08 |
| Compra y venta de objetos | Franco | 2026-05-15 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-05-01 — Primer código del equipo

- **Participantes:** Franco, Alejandro.
- **Ausentes:** sin datos.

### Temas tratados

- Se abre una sesión de Live Share para trabajar el código en conjunto.
- Franco publica el repositorio del equipo (`FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol`)
  y sube `javaScript.js`.
- Franco comparte el correo institucional de la facultad.

### Decisiones

- El repositorio de Franco es el repositorio oficial del equipo.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Definir los métodos de las clases del dominio | Franco | 2026-05-08 |

### Pendientes de la reunión anterior

- Ninguno registrado.

## 2026-04-17 — Propuesta y entidades adicionales

- **Participantes:** Franco, Renzo, Alejandro, Octavio.
- **Ausentes:** sin datos.

### Temas tratados

- Se arma `proposal.md` en el repositorio del equipo (muchos commits de Franco). Cada integrante agrega
  su nombre y usuario de GitHub (Renzo, Alejandro, Octavio).
- Se revisa el modelo de dominio (`ModeloDominio.drawio.png`) y un video de apoyo.
- Renzo sugiere entidades adicionales para el modelo: **Reseña** del anfitrión (puntuación, comentario,
  fecha), **Solicitud** de unión a una partida (pendiente, aceptada o rechazada), **Notificación** y
  **Mensaje** de chat dentro de una sesión.

### Decisiones

- Se avanza con `proposal.md` como documento de la propuesta.
- Las entidades sugeridas por Renzo quedan como opcionales; no entraron en el modelo base.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Completar y pulir `proposal.md` | Franco | 2026-07-08 |
| Agregar nombre y usuario al `proposal.md` | Cada integrante | 2026-04-17 |

### Pendientes de la reunión anterior

- Matriz CRUD y consulta con el docente (ver 2026-04-10).

## 2026-04-10 — Matriz CRUD y modelo de dominio

- **Participantes:** Franco, Octavio, Renzo, Alejandro.
- **Ausentes:** Emanuel participó a medias por problemas de conexión y quedó en ponerse al día por
  WhatsApp.

### Temas tratados

- Se trabajó la matriz CRUD eligiendo las clases sustantivas, para verificarla después en una clase de
  consulta con el docente.
- Se empezó el modelo de dominio en draw.io. Se discutió si `tipoObjeto` debía ser una clase;
  se resolvió dejarlo como atributo porque no tiene atributos propios.
- Cierre de la votación del tema (encuesta `TEMA`, cerrada ese día).
- Franco y Emanuel organizan a quién le toca cada parte; entre cuatro alcanza para avanzar.

### Decisiones

- `tipoObjeto` queda como atributo de `Objeto` y no como clase.
- Se sigue con el tema ya votado (gestor de partidas de rol).

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Terminar el modelo de dominio en draw.io | Franco, Octavio, Renzo y Alejandro | 2026-04-17 |
| Ponerse al día y ayudar donde haga falta | Emanuel | 2026-04-17 |

### Pendientes de la reunión anterior

- Elegir el tema definitivo (cerrado con la encuesta).

## 2026-04-03 — Primera reunión: elección del tema

- **Participantes:** Franco, Renzo, Alejandro, Octavio, Emanuel (se fue sumando durante la mañana).
- **Ausentes:** —

### Temas tratados

- Se barajaron cinco ideas para el proyecto: sistema de QR de asistencia para la UTN, compra y venta
  de boletos, gestor de partidas de rol, compra y venta de videojuegos, gestor de club de pueblo y un
  "Mercado Libre" con sistemas de programación dinámica para ajustar precios y competencia. Renzo
  también trajo la opción de un turnero para un club o canchas de fútbol (propuesta de la cátedra).
- Se leyó el GitHub de la cátedra (`utnfrrodsw`) para alinearse con lo que se pide.
- Se hizo un fork del repositorio de la cátedra, necesario para la regularidad.
- Se repasaron los requisitos de CRUD de cada una de las ideas.
- Franco creó el documento de la matriz CRUD en Google Docs.

### Decisiones

- Elegir el tema por votación (la encuesta se cerró el 10/04).
- Trabajar en un fork del repositorio de la cátedra.

### Asignaciones

| Tarea | Responsable | Para cuándo |
| --- | --- | --- |
| Armar la matriz CRUD | Franco (con el equipo) | 2026-04-10 |
| Crear el fork de la cátedra | Franco | 2026-04-10 |

### Pendientes de la reunión anterior

- No hay reuniones anteriores.
