# Documentación de la API HTTP

Rutas base: `http://localhost:3000/api`

Todo el intercambio (cuerpo de solicitud y respuesta) es en formato `application/json`.
Si ocurre un error, el servidor responde con `{ "message": "Descripción clara" }` y el código HTTP
correspondiente.

`idUsuario`, `idPartida`, `idPersonaje` y `idObjeto` son claves primarias autoincrementales (entero,
1 en adelante). Las claves compuestas se pasan en la ruta (ej: `/sesiones/1/2`).

## Cuentas `/auth`

- `POST /auth/register` — `{ nombreUsuario, nickname, contrasena, tipo }` (`tipo` puede ser
  `"jugador"` o `"anfitrion"`). Crea el usuario y su perfil.
- `POST /auth/login` — `{ nickname, contrasena }`.
- `GET /auth/me` — `{ idUsuario, nombreUsuario, nickname, tipo }`.
- `POST /auth/logout` — cierra sesión.
- `PUT /auth/me/password` — `{ actual, nueva }`.
- `POST /auth/me/profiles` — `{ tipo: "jugador" }`. Agrega el segundo perfil a una cuenta
  existente.
- `DELETE /auth/me/profiles/:tipo` — borra el perfil si no tiene datos asociados (personajes
  o partidas, respectivamente).

## Catálogos `/clases` y `/tiendas`

Las clases y tiendas están predefinidas y son de solo lectura. Todo usuario autenticado puede
leerlas.

- `GET /clases` — devuelve el listado completo (`[{ idClase, nombre, descripcion, puntosVida }]`).
- `GET /clases/:id` — devuelve la clase si existe (**404** si no).
- `GET /tiendas` — devuelve el catálogo de objetos de todas las tiendas (solo hay una por clase).
- `GET /tiendas/:id` — **404** si la tienda no existe. Devuelve los objetos a la venta
  `[{ idObjeto, nombre, descripcion, clase: { idClase, nombre }, valor, unico }]`.

## Partidas `/partidas`

- `GET /partidas` — devuelve todas las partidas del anfitrión (para armar el dashboard).
- `GET /partidas/activas` — lista pública de partidas donde se pueden unir personajes
  (`[{ idPartida, nombre, anfitrion: { usuario: { nombreUsuario } }, publico }]`).
- `GET /partidas/:id` — detalle de la partida, accesible solo para el anfitrión (trae el arreglo
  de sesiones) y los jugadores que tienen personaje ahí. **404** si no existe; **403** si no tenés
  acceso.
- `POST /partidas` — `{ nombre, contrasena? }`. Si no se envía contraseña, la partida es pública.
  El creador queda como anfitrión. **400** si el nombre está vacío.
- `PUT /partidas/:id` — `{ nombre, contrasena? }`. Omita `contrasena` (o envíe string vacío) para
  hacerla pública. **403** si no sos el dueño; **400** si el nombre está vacío.
- `DELETE /partidas/:id` — **409** si tiene personajes o sesiones, **403** si no sos el dueño.

## Personajes `/personajes`

- `GET /personajes` — personajes del jugador logueado (`[{ idPersonaje, nombreFicticio, raza }]`).
- `GET /personajes?idClase=2` — filtra los personajes por id de clase.
- `GET /personajes/:id` — `{ idPersonaje, nombreFicticio, raza, clase, jugador, partida }`.
  Muestra todo el detalle.
- `POST /personajes` — `{ nombreFicticio, raza, idClase, idPartida, contrasena? }`.
  El jugador se une a una partida. **403** si la partida no está activa; **409** si el cupo
  de jugadores está lleno (6) o si la partida es privada y la contraseña no coincide. Devuelve
  **401** (con el campo `requiereContrasena: true`) si es privada pero el jugador no envió la
  contraseña.
- `PUT /personajes/:id` — solo `nombreFicticio`, `raza` e `idClase`; cualquier otro campo da **403**.
- `DELETE /personajes/:id` — **409** si tiene objetos o historial de sesiones.

## Sesiones `/sesiones`

- `GET /sesiones` — arreglo con todas las sesiones (devuelve idPartida, numSesion, duracionSesion, cantJugadores, estadoSesion).
- `GET /sesiones/:idPartida/:numSesion` — detalle de la sesión, agrega el arreglo `participantes` con `idPersonaje`, `nombre` y `dioKarma`.
- `POST /sesiones` — `{ idPartida, numSesion, duracionSesion }` (solo el anfitrión de la partida). Devuelve la sesión creada y código **201**; **409** si ese número de sesión ya existe o la partida está finalizada.
- `PUT /sesiones/:idPartida/:numSesion` — `{ duracionSesion }`; la clave no se cambia. Devuelve la sesión actualizada. **409** si la sesión ya no está planificada.
- `DELETE /sesiones/:idPartida/:numSesion` — devuelve **204** sin cuerpo. **409** si la sesión ya se inició o si todavía tiene misiones.
- `POST /sesiones/:idPartida/:numSesion/jugar` — `{ "idPersonajes": [1, 2] }`. Solo el anfitrión.
  Valida que la partida esté activa y la sesión planificada, que los personajes sean de la partida
  (uno por jugador), el límite de jugadores y que no haya otra sesión en curso (**409**). Ids
  repetidos: **400**. Responde la sesión actualizada con `estadoSesion: 1`.
- `POST /sesiones/:idPartida/:numSesion/finalizar` — solo el anfitrión; devuelve la sesión finalizada. **409** si la sesión no
  está en curso o quedan misiones pendientes.
- `POST /sesiones/:idPartida/:numSesion/calificar` — `{ "valor": 1 }` o `{ "valor": -1 }`.
  La sesión debe estar finalizada (**409**). **403** si no participaste; **409** si ya calificaste
  o si sos el anfitrión. Responde `{ "karma": <nuevoKarma> }`.

`estadoSesion`: `0` planificada, `1` en curso, `2` finalizada.

## Misiones `/misiones`

- `GET /misiones` — arreglo de misiones (con idPartida, numSesion, numMision, descripcion, dineroTotal, xpTotal, dineroOtorgadoAJugadores, xpOtorgadoJugadores, asistenciaGrupoGrande, estado).
- `GET /misiones/:idPartida/:numSesion/:numMision` — detalle de una misión.
- `POST /misiones` — recibe `{ idPartida, numSesion, numMision, descripcion, dineroTotal, xpTotal, asistenciaGrupoGrande? }`. Solo el anfitrión. Devuelve la misión creada y **201**; **409** si la sesión está finalizada o el número ya existe.
- `PUT /misiones/:idPartida/:numSesion/:numMision` — `{ descripcion, dineroTotal, xpTotal, asistenciaGrupoGrande? }`;
  la clave viene de la URL. No es una edición parcial: los tres primeros son obligatorios y, si se
  omite `asistenciaGrupoGrande`, vuelve a `0`. Devuelve la misión actualizada. **409** si la misión está completada o la sesión finalizada.
- `DELETE /misiones/:idPartida/:numSesion/:numMision` — devuelve **204** sin cuerpo. Solo si sigue pendiente y la sesión no finalizó.
- `POST /misiones/:idPartida/:numSesion/:numMision/completar` —
  recibe `{ "recompensas": [{ "idPersonaje": 1, "dinero": 100, "xp": 50 }] }`.
  Devuelve la misión actualizada.
  Acredita a cada participante y marca la misión completada en **una sola transacción**.
  **400** si hay personajes repetidos. **409** si la misión ya estaba completada, si la sesión no está en curso, si hay personajes ajenos a la sesión, o si las sumas no coinciden con `dineroTotal` y `xpTotal`.

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
