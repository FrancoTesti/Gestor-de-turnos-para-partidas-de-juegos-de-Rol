# Referencia de la API

Base: `http://localhost:3000/api`. Todo viaja en JSON (`Content-Type: application/json`).

La sesión se transporta en la cookie **HttpOnly** `rpg_session`; no hay tokens en el cuerpo ni en
cabeceras. Desde el navegador el frontend usa rutas relativas (`/api/...`) y el proxy de Vite
reenvía al backend, así que la cookie viaja sola. Con `curl` hay que guardarla (`-c`/`-b`).

Rutas públicas: `GET /health`, `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`.
**Todas las demás responden `401` sin sesión.**

## Errores comunes

| Código | Cuándo | Cuerpo |
| --- | --- | --- |
| 400 | Datos inválidos (Zod o validadores) o ID mal formado | `{ "message": "contrasena: El campo contrasena debe tener al menos 6 caracteres" }` |
| 401 | Falta la cookie, expiró o la contraseña cambió | `{ "message": "Iniciá sesión para continuar" }` / `{ "message": "La sesión expiró" }` |
| 403 | La sesión no puede operar sobre ese recurso | `{ "message": "Solo podés modificar tu propia cuenta" }` |
| 404 | El recurso no existe | `{ "message": "Usuario no encontrado" }` |
| 409 | Conflicto de negocio o de integridad | `{ "message": "Ese nickname ya está en uso. Elegí otro para poder iniciar sesión." }` |
| 429 | Más de 30 POST a `/auth` en 15 minutos desde la misma IP | `{ "message": "Demasiados intentos. Probá en 15 minutos." }` |
| 500 | Error no previsto (se registra en el servidor) | `{ "message": "No se pudo completar la operación" }` |

Los `204` no traen cuerpo. El cliente del frontend (`frontend/src/services/api.ts`) los devuelve
como `undefined` y convierte cualquier error en un `ApiError` con `status` y `message`.

## Autenticación y cuenta

### POST `/auth/register`
Crea la cuenta y su primer perfil. Pública.

```json
{ "nombreUsuario": "Emanuel Salomón", "nickname": "emasalomon", "contrasena": "PruebaSegura123", "tipo": "jugador" }
```

- `nombreUsuario`: 2–50 caracteres. `nickname`: 3–50, único. `contrasena`: 6–100, se guarda con scrypt.
- `imagen`: opcional, hasta 255 caracteres. `tipo`: `"jugador"` o `"anfitrion"`.
- **201**: `{ "idUsuario": 1, "nombreUsuario": "...", "nickname": "...", "imagen": "" }` (nunca devuelve la contraseña).
- **409**: nickname repetido. **400**: campos faltantes o cortos.

### POST `/auth/login`
```json
{ "nickname": "emasalomon", "contrasena": "PruebaSegura123" }
```
- **200**: `{ "usuario": {...}, "roles": { "idUsuario": 1, "jugador": true, "anfitrion": false } }` + `Set-Cookie: rpg_session=…; HttpOnly`.
- **401**: `Usuario o contraseña incorrecta` (mismo mensaje para nickname inexistente y para clave errónea).
- La sesión dura 8 horas y un login nuevo invalida el anterior de esa cuenta.

### GET `/auth/me`
Recupera la sesión al recargar la página. **200** con `{ usuario, roles }`, **401** si no hay cookie válida.

### POST `/auth/logout`
**204** siempre; borra la cookie aunque ya estuviera vencida.

## Usuarios `/usuarios`

| Método | Ruta | Quién | Cuerpo |
| --- | --- | --- | --- |
| GET | `/usuarios` | cualquier sesión | — |
| GET | `/usuarios/:id` | cualquier sesión | — |
| POST | `/usuarios` | solo anfitriones | `{ nombreUsuario, nickname, contrasena, imagen? }` |
| PUT | `/usuarios/:id` | solo la cuenta propia | los mismos campos, todos opcionales, al menos uno |
| DELETE | `/usuarios/:id` | solo la cuenta propia | — |

- Las respuestas nunca incluyen `contrasena`.
- **409** si el nickname ya existe, o si la cuenta tiene personajes/partidas al eliminarla.
- Cambiar la propia contraseña invalida la sesión: el frontend cierra sesión y pide volver a entrar.

## Perfiles `/jugadores` y `/anfitriones`

| Método | Ruta | Cuerpo | Notas |
| --- | --- | --- | --- |
| GET | `/jugadores`, `/jugadores/:id` | — | incluye `nombreUsuario`, `nickname`, `imagen` del usuario |
| POST | `/jugadores` | `{ idUsuario, estado }` | solo el propio `idUsuario` |
| PUT | `/jugadores/:id` | `{ estado }` | solo el propio perfil |
| DELETE | `/jugadores/:id` | — | **409** si tiene personajes |
| GET | `/anfitriones`, `/anfitriones/:id` | — | `cantPartidasActuales` se cuenta en el momento |
| POST | `/anfitriones` | `{ idUsuario }` | el servidor fija `karma: 0` y `cantPartidasActuales: 0` |
| PUT | `/anfitriones/:id` | — | **403**: el karma y las partidas los calcula el servidor |
| DELETE | `/anfitriones/:id` | — | **409** si tiene partidas |

## Catálogo: clases, tiendas y objetos

Altas, bajas y modificaciones **solo para anfitriones**; las lecturas, para cualquier sesión.

- `/clases` — `{ nombreClase, descripcionClase }`.
- `/tiendas` — `{ nombre, claseTienda, idClase? }`.
- `/objetos` — `{ nombre, descripcion, tipoObjeto, valor, nivelObjeto, esUnico?, idTienda?, posicion? }`.
  **409** al editar un objeto que ya está en un inventario: se mueve o se vende, no se edita.
- `GET /objetos/sugeridos/:idPersonaje` — objetos disponibles para la clase de ese personaje
  (nombre, tipo y valor). El personaje debe ser propio.
- `GET /objetos/sugeridos/clase/:idClase` — el mismo listado partiendo de la clase.

## Partidas `/partidas`

- `GET /partidas`, `GET /partidas/activas`, `GET /partidas/:id` — el listado de activas muestra
  nombre, privacidad y anfitrión.
- `POST /partidas` — `{ nombre, estado: "activa"|"finalizada", limiteJugadores, esPrivada, contrasena?, idUsuarioAnfitrion }`.
  Solo el anfitrión propio; `contrasena` es obligatoria si `esPrivada` es `true`.
- `PUT`/`DELETE /partidas/:id` — solo el anfitrión dueño (**403** en caso contrario).

## Personajes `/personajes`

- `GET /personajes`, `GET /personajes?idClase=3`, `GET /personajes/:id` — devuelven nombre, raza,
  xp, nivel, dinero, clase, jugador y partida.
- `POST /personajes` — `{ nombreFicticio, raza, idClase, idUsuarioJugador, idPartida, contrasenaPartida? }`.
  El servidor fija `dinero: 100`, `xp: 0`, `nivel: 1` y crea el inventario inicial en la misma
  transacción. **403** si el jugador no es el propio; **409** por cupo lleno, partida finalizada o
  contraseña incorrecta.
- `PUT /personajes/:id` — solo `nombreFicticio`, `raza` e `idClase`; cualquier otro campo da **403**.
- `DELETE /personajes/:id` — **409** si tiene objetos o historial de sesiones.

## Sesiones `/sesiones`

- `GET /sesiones` — todas las sesiones con su partida.
- `GET /sesiones/:idPartida/:numSesion` — agrega `participantes` con `idPersonaje`, `nombre` y `dioKarma`.
- `POST /sesiones` — `{ idPartida, numSesion, duracionSesion }` (solo el anfitrión de la partida).
- `PUT /sesiones/:idPartida/:numSesion` — `{ duracionSesion }`; la clave no se cambia.
- `DELETE /sesiones/:idPartida/:numSesion`.
- `POST /sesiones/:idPartida/:numSesion/jugar` — `{ "idPersonajes": [1, 2] }`. Valida que los
  personajes sean de la partida, el límite de jugadores y que no haya otra sesión en curso.
- `POST /sesiones/:idPartida/:numSesion/finalizar` — **409** si quedan misiones pendientes.
- `POST /sesiones/:idPartida/:numSesion/calificar` — `{ "valor": 1 }` o `{ "valor": -1 }`.
  Solo un participante, una sola vez por sesión (**409** si repite) y nunca el propio anfitrión.

`estadoSesion`: `0` planificada, `1` en curso, `2` finalizada.

## Misiones `/misiones`

- `GET /misiones`, `GET /misiones/:idPartida/:numSesion/:numMision`.
- `POST /misiones` — `{ idPartida, numSesion, numMision, descripcion, dineroTotal, xpTotal, asistenciaGrupoGrande? }`.
- `PUT /misiones/:idPartida/:numSesion/:numMision` — mismos campos; la clave viene de la URL.
- `DELETE /misiones/:idPartida/:numSesion/:numMision` — solo si sigue pendiente.
- `POST /misiones/:idPartida/:numSesion/:numMision/completar` —
  `{ "recompensas": [{ "idPersonaje": 1, "dinero": 100, "xp": 50 }] }`.
  Acredita a cada participante y marca la misión completada en **una sola transacción**.
  **409** si la misión ya estaba completada, si hay personajes repetidos o ajenos a la sesión, o si
  las sumas no coinciden con `dineroTotal` y `xpTotal`.

## Inventarios y comercio

- `GET /inventarios` — solo los inventarios de los personajes de la sesión actual.
- `GET /inventarios/:idPersonaje/:numInventario` — agrega los objetos con su `posicion`, `valor` y
  el rango de venta (`minimo`, `maximo`).
- `POST /inventarios` — `{ idPersonaje, numInventario, cantidadEspacio }` (máximo 1000).
- `PUT`/`DELETE /inventarios/:idPersonaje/:numInventario` — **409** si al reducir la capacidad o
  eliminar quedan objetos guardados.
- `POST /inventarios/:idPersonaje/:numInventario/mover` — `{ idObjeto, posicion }`; entre
  inventarios del mismo personaje, con la posición libre.
- `POST /objetos/:id/comprar` — `{ idPersonaje, numInventario, posicion }`. Descuenta el dinero,
  con bloqueo pesimista en MySQL para que dos compras simultáneas no dupliquen el objeto.
- `POST /objetos/:id/vender` — `{ idPersonaje, idTienda, precio }`. El precio debe caer entre el
  70 % y el 100 % del valor del objeto (`docs/funcionalidad.md` explica el redondeo).

## Probar a mano con curl

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"nombreUsuario":"Prueba Manual","nickname":"prueba","contrasena":"PruebaSegura123","tipo":"anfitrion"}'

curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"nickname":"prueba","contrasena":"PruebaSegura123"}'

curl -b cookies.txt http://localhost:3000/api/auth/me
curl -b cookies.txt http://localhost:3000/api/partidas/activas
```
