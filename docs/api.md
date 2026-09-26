# Referencia de la API

Base: `http://localhost:3000/api`. Todo viaja en JSON (`Content-Type: application/json`), con un
cuerpo de hasta 64 KB; uno más grande se rechaza con **413** antes de llegar a cualquier ruta.

La sesión se transporta en la cookie **HttpOnly** `rpg_session`; no hay tokens en el cuerpo ni en
cabeceras. Desde el navegador el frontend usa rutas relativas (`/api/...`) y el proxy de Vite
reenvía al backend, así que la cookie viaja sola. Con `curl` hay que guardarla (`-c`/`-b`).

Rutas públicas: `GET /health`, `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`.
**Todas las demás responden `401` sin sesión.**

## Errores comunes

| Código | Cuándo | Cuerpo |
| --- | --- | --- |
| 400 | Datos inválidos (Zod o validadores) o ID mal formado | `{ "message": "contrasena: El campo contrasena debe tener al menos 6 caracteres" }` |
| 400 | El cuerpo no es JSON válido | `{ "message": "JSON inválido" }` |
| 401 | Falta la cookie o la sesión venció | `{ "message": "Iniciá sesión para continuar" }` |
| 401 | La contraseña cambió o el usuario ya no existe | `{ "message": "La sesión expiró" }` |
| 403 | La sesión no puede operar sobre ese recurso | `{ "message": "Solo podés modificar tu propia cuenta" }` |
| 403 | Escritura (`POST`/`PUT`/`DELETE`) con una cabecera `Origin` distinta de `CORS_ORIGIN` | `{ "message": "Origen no permitido" }` |
| 404 | El recurso no existe | `{ "message": "Usuario no encontrado" }` |
| 404 | La ruta no existe | `{ "message": "No existe la ruta GET /api/..." }` |
| 409 | Conflicto de negocio o de integridad | `{ "message": "Ese nickname ya está en uso. Elegí otro para poder iniciar sesión." }` |
| 409 | Restricción única o clave foránea de MySQL no cubierta por un mensaje propio | `{ "message": "Ese registro ya existe" }` / `{ "message": "El registro tiene datos relacionados; eliminarlos primero" }` |
| 413 | El cuerpo de la solicitud supera los 64 KB (por ejemplo, una descripción muy larga pegada en un formulario) | `{ "message": "Los datos enviados superan el límite de 64 KB. Acortá el texto e intentá de nuevo." }` |
| 429 | Más de 30 `POST` a `/auth/register` o `/auth/login` (en total, exitosos o no) en 15 minutos desde la misma IP | `{ "message": "Demasiados intentos. Probá en 15 minutos." }` |
| 500 | Error no previsto (se registra en el servidor) | `{ "message": "No se pudo completar la operación" }` |
| 503 | Login con 5000 sesiones abiertas en el servidor | `{ "message": "Servidor ocupado. Intentá más tarde." }` |

En `POST`/`PUT /usuarios` el 400 tiene otro formato, con el detalle por campo:
`{ "message": "Datos de entrada inválidos", "errors": [{ "campo": "contrasena", "mensaje": "..." }] }`.

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
- El perfil de jugador se crea con `estado: true`; el de anfitrión, con karma y partidas en 0.
- **409**: nickname repetido. **400**: campos faltantes, cortos o no previstos (el cuerpo es estricto).

### POST `/auth/login`
```json
{ "nickname": "emasalomon", "contrasena": "PruebaSegura123" }
```
- **200**: `{ "usuario": {...}, "roles": { "idUsuario": 1, "jugador": true, "anfitrion": false } }` +
  `Set-Cookie: rpg_session=…; HttpOnly; SameSite=Strict; Path=/api` (y `Secure` con `NODE_ENV=production`).
- **401**: `Usuario o contraseña incorrecta` (mismo mensaje para nickname inexistente y para clave errónea).
- **400**: cuerpo inválido o con campos de más.
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
- **409** si el nickname ya existe (`El nickname ya está en uso`), o si la cuenta tiene
  personajes/partidas al eliminarla.
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

Altas, bajas y modificaciones **solo para anfitriones** (**403** si la cuenta no es anfitrión); las lecturas (`GET`), para cualquier sesión autenticada.

- `/clases` — `{ nombreClase, descripcionClase }`.
- `/tiendas` — `{ nombre, claseTienda, idClase? }`.
  - `POST /tiendas`: **201** `{ idTienda, nombre, claseTienda, idClase }`. **400** si los campos son inválidos o `idClase` no existe.
  - `PUT /tiendas/:id`: **200** `{ idTienda, nombre, claseTienda, idClase }`. **404** si la tienda no existe; **400** si `idClase` no existe.
  - `DELETE /tiendas/:id`: **204**; **409** si la tienda tiene objetos o datos asociados.
- `/objetos` — `{ nombre, descripcion, tipoObjeto, valor, nivelObjeto, esUnico?, idTienda?, posicion? }`.
  - `POST /objetos`: **201** `{ idObjeto, nombre, descripcion, tipoObjeto, valor, nivelObjeto, esUnico, idTienda, idPersonaje, numInventario, posicion }`.
  - `PUT`/`DELETE /objetos/:id`: **409** (`Un objeto adquirido solo puede moverse mediante el inventario o una venta`) si el objeto pertenece a un inventario; **404** si el objeto no existe.
- `GET /objetos/sugeridos/:idPersonaje` — objetos a la venta en tiendas de la clase de ese personaje (los que no están en ningún inventario), con el mismo formato que `GET /objetos`. El personaje debe ser propio (**403**; **404** si no existe).
- `GET /objetos/sugeridos/clase/:idClase` — el mismo listado partiendo del ID de la clase.

## Partidas `/partidas`

- `GET /partidas`, `GET /partidas/activas`, `GET /partidas/:id` — el listado de activas muestra
  nombre, privacidad y anfitrión.
- `POST /partidas` — `{ nombre, estado: "activa"|"finalizada", limiteJugadores, esPrivada, contrasena?, idUsuarioAnfitrion }`.
  Solo el anfitrión propio; `contrasena` es obligatoria si `esPrivada` es `true` y no se admite si
  es `false` (**400**).
- `PUT /partidas/:id` — `{ nombre?, estado?, limiteJugadores?, esPrivada?, contrasena? }`, sin
  `idUsuarioAnfitrion`. **400** si el límite queda por debajo de los personajes inscriptos o si se
  finaliza con una sesión en curso.
- `DELETE /partidas/:id` — **409** si tiene personajes o sesiones.
- `PUT` y `DELETE` solo para el anfitrión dueño (**403** en caso contrario).

## Personajes `/personajes`

- `GET /personajes`, `GET /personajes?idClase=3`, `GET /personajes/:id` — devuelven nombre, raza,
  xp, nivel, dinero, clase, jugador y partida.
- `POST /personajes` — `{ nombreFicticio, raza, idClase, idUsuarioJugador, idPartida, contrasenaPartida? }`.
  El servidor fija `dinero: 100`, `xp: 0`, `nivel: 1` y crea el inventario inicial
  (`numInventario` 1, 10 espacios) en la misma transacción. **403** si el jugador no es el propio;
  **400** si la partida está finalizada, el jugador está inactivo, la contraseña es incorrecta, no
  hay cupo o ya tenés un personaje en esa partida; **404** si la clase, el jugador o la partida no
  existen.
- `PUT /personajes/:id` — solo `nombreFicticio`, `raza` e `idClase`; cualquier otro campo da **403**.
- `DELETE /personajes/:id` — **409** si tiene objetos o historial de sesiones.

## Sesiones `/sesiones`

- `GET /sesiones` — todas las sesiones con su partida.
- `GET /sesiones/:idPartida/:numSesion` — agrega `participantes` con `idPersonaje`, `nombre` y `dioKarma`.
- `POST /sesiones` — `{ idPartida, numSesion, duracionSesion }` (solo el anfitrión de la partida).
  **201**; **409** si ese número de sesión ya existe o la partida está finalizada.
- `PUT /sesiones/:idPartida/:numSesion` — `{ duracionSesion }`; la clave no se cambia. **409** si
  la sesión ya no está planificada.
- `DELETE /sesiones/:idPartida/:numSesion` — **204**; **409** si la sesión ya se inició o tiene
  misiones.
- `POST /sesiones/:idPartida/:numSesion/jugar` — `{ "idPersonajes": [1, 2] }`. Solo el anfitrión.
  Valida que la partida esté activa y la sesión planificada, que los personajes sean de la partida
  (uno por jugador), el límite de jugadores y que no haya otra sesión en curso (**409**). Ids
  repetidos: **400**. Responde la sesión con `estadoSesion: 1`.
- `POST /sesiones/:idPartida/:numSesion/finalizar` — solo el anfitrión; **409** si la sesión no
  está en curso o quedan misiones pendientes.
- `POST /sesiones/:idPartida/:numSesion/calificar` — `{ "valor": 1 }` o `{ "valor": -1 }`.
  La sesión debe estar finalizada (**409**). **403** si no participaste; **409** si ya calificaste
  o si sos el anfitrión. Responde `{ "karma": n }`.

`estadoSesion`: `0` planificada, `1` en curso, `2` finalizada.

## Misiones `/misiones`

- `GET /misiones`, `GET /misiones/:idPartida/:numSesion/:numMision`.
- `POST /misiones` — `{ idPartida, numSesion, numMision, descripcion, dineroTotal, xpTotal, asistenciaGrupoGrande? }`.
  Solo el anfitrión. **201**; **409** si la sesión está finalizada o el número ya existe.
- `PUT /misiones/:idPartida/:numSesion/:numMision` — `{ descripcion, dineroTotal, xpTotal, asistenciaGrupoGrande? }`;
  la clave viene de la URL. No es una edición parcial: los tres primeros son obligatorios y, si se
  omite `asistenciaGrupoGrande`, vuelve a `0`. **409** si la misión está completada o la sesión
  finalizada.
- `DELETE /misiones/:idPartida/:numSesion/:numMision` — solo si sigue pendiente.
- `POST /misiones/:idPartida/:numSesion/:numMision/completar` —
  `{ "recompensas": [{ "idPersonaje": 1, "dinero": 100, "xp": 50 }] }`.
  Acredita a cada participante y marca la misión completada en **una sola transacción**.
  **400** si hay personajes repetidos. **409** si la sesión no está en curso o la misión ya estaba
  completada, si hay personajes ajenos a la sesión, o si las sumas no coinciden con `dineroTotal` y
  `xpTotal`.

## Inventarios y comercio

- `GET /inventarios` — solo los inventarios de los personajes pertenecientes al usuario logueado (`[{ idPersonaje, numInventario, cantidadEspacio }]`).
- `GET /inventarios/:idPersonaje/:numInventario` — agrega `objetos` con su `posicion`, `valor` y el rango de precio de venta permitido (`minimo`, `maximo`, calculados del 70 % al 100 % del valor base con `Math.ceil` y `Math.floor`). **403** si el personaje pertenece a otro jugador; **404** si el inventario no existe.
- `POST /inventarios` — `{ idPersonaje, numInventario, cantidadEspacio }` (1 a 1000). **201** `{ idPersonaje, numInventario, cantidadEspacio }`; **403** si el personaje no es propio; **409** si ese inventario ya existe para el personaje.
- `PUT /inventarios/:idPersonaje/:numInventario` — `{ cantidadEspacio }`. **200**; **403** si el personaje no es propio; **404** si el inventario no existe; **409** si al reducir la capacidad existen objetos guardados en posiciones mayores o iguales a la nueva `cantidadEspacio`.
- `DELETE /inventarios/:idPersonaje/:numInventario` — **204**; **403** si el personaje no es propio; **404** si el inventario no existe; **409** si el inventario contiene objetos.
- `POST /inventarios/:idPersonaje/:numInventario/mover` — `{ idObjeto, posicion }`; entre inventarios del mismo personaje. El inventario de la URL es el destino. **200** `{ idObjeto, idPersonaje, numInventario, cantidadEspacio, posicion }`. **403** si el objeto o personaje no pertenece al usuario logueado; **404** si el objeto o inventario no existe; **409** si la posición supera la capacidad o la casilla de destino ya está ocupada.
- `POST /objetos/:id/comprar` — `{ idPersonaje, numInventario, posicion }`. Descuenta el dinero con bloqueo pesimista en MySQL (`FOR UPDATE`) para asegurar concurrencia sin duplicados.
  **200** `{ objeto, idPersonaje, numInventario, dineroRestante }`. **403** si el personaje no es propio; **404** si el objeto, personaje o inventario no existe; **409** si el objeto no está a la venta, falta saldo, el inventario está lleno o la posición está ocupada; **400** si la posición supera la capacidad o el objeto único ya pertenece a otro personaje de la misma partida.
- `POST /objetos/:id/vender` — `{ idPersonaje, idTienda, precio }`. El precio debe caer entre el 70 % y el 100 % del valor del objeto (`docs/funcionalidad.md` y `src/services/venta.rules.ts` explican el redondeo).
  **200** `{ idObjeto, idPersonaje, dineroRestante, precio }`. **403** si el personaje no es propio; **404** si el objeto o la tienda no existe; **409** si el objeto no está en tu inventario, la tienda es de otra clase, el precio está fuera de rango o el saldo superaría el entero máximo.

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
