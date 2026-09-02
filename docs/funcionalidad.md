# Funcionalidad y reglas implementadas

## Permisos

Registro permite elegir jugador o anfitrión. En **Perfiles** cada usuario puede crear su segundo perfil, activar/desactivar su jugador o eliminar un perfil sin dependencias. Un anfitrión no es administrador de cuentas ajenas.

| Operación | Permiso |
| --- | --- |
| Leer catálogos y listas públicas de la aplicación | Cuenta autenticada |
| Editar/borrar usuario | Solo la propia cuenta |
| Crear otra cuenta desde Usuarios | Anfitrión |
| Administrar clases, tiendas y objetos no adquiridos | Anfitrión |
| Administrar partida, sesiones y misiones | Anfitrión de esa partida |
| Crear personaje, comprar/vender y administrar inventario | Jugador propietario |
| Calificar anfitrión | Jugador participante, después de finalizar la sesión |

Las contraseñas de usuario nunca se devuelven en los DTO. El cliente no decide identidad, permisos, saldo, XP ni karma. Cambiar la contraseña obliga a volver a ingresar.

## Personajes y partidas

Crear personaje requiere jugador activo, clase existente, partida activa, cupo disponible y contraseña correcta si es privada. Un jugador tiene como máximo un personaje por partida. Se crea un inventario número 1 de diez espacios dentro de la misma transacción. Valores iniciales: dinero 100, XP 0, nivel 1.

El CRUD del jugador permite editar nombre, raza y clase, no adjudicarse recompensas ni transferir personajes a otro usuario. No se borra un personaje con historial de sesiones ni con objetos. Una partida no puede reducir su cupo por debajo de sus personajes ni finalizar con una sesión en curso.

Para pasar una partida pública a privada se exige una contraseña. Pasarla a pública la elimina. Editar una privada sin contraseña nueva conserva la existente. La cantidad de partidas activas del anfitrión se calcula al consultar, no se recibe del cliente.

## Objetos e inventarios

- Comprar: objeto disponible en tienda, inventario propio, saldo suficiente, espacio y posición libre.
- Posiciones desde 0 hasta `cantidadEspacio - 1`; capacidad entre 1 y 1000.
- Vender: el jugador elige un precio entero entre `ceil(valor × 0.70)` y `floor(valor × 1.00)`. Los porcentajes están centralizados en `src/services/venta.rules.ts`.
- Una venta acredita ese precio, mueve el objeto a la tienda y vacía su referencia al inventario. No permite venderlo dos veces.
- Mover: solo entre inventarios del mismo personaje, a una posición válida y libre.
- No se elimina un inventario ocupado ni se reduce su capacidad dejando objetos fuera del rango.
- El catálogo no permite editar ni borrar directamente objetos adquiridos.
- Los sugeridos se obtienen por la clase asociada a la tienda, comparada con la clase del personaje.

Compra, venta y movimientos usan transacciones y bloqueos de filas. Las pruebas MySQL verifican rollback real y compras concurrentes.

## Sesiones, misiones y karma

Sesión: `0 = planificada`, `1 = en curso`, `2 = finalizada`. Crear y editar planifica; **Iniciar sesión** fija la asistencia. Solo se admite una sesión en curso por partida, sin personajes ajenos ni dos personajes del mismo jugador. Después de comenzar no se borra el historial.

El anfitrión crea misiones con dinero y XP totales. Al completarlas distribuye esos totales explícitamente entre participantes de la sesión. La suma debe coincidir exactamente; se pueden asignar ceros a participantes. No se inventó una fórmula automática de reparto o subida de nivel. `asistenciaGrupoGrande` se conserva como dato, sin aplicar multiplicadores no definidos por el grupo.

Completar marca la misión y acredita recompensas en una única transacción. No puede repetirse, incluso con solicitudes simultáneas. Para finalizar la sesión no deben quedar misiones pendientes. Las misiones completadas no se editan ni borran.

Después de finalizar, cada jugador participante puede dar `+1` o `-1` al karma del anfitrión una sola vez por sesión. No se permite autocalificación ni editar el karma desde el CRUD.

## Rutas

Todas llevan `/api`. Solo `/health`, `/auth/register` y `/auth/login` son públicas; `/auth/logout` permite limpiar la cookie incluso si expiró.

- `/auth/me`: sesión actual.
- CRUD simple: `/usuarios`, `/jugadores`, `/anfitriones`, `/clases`, `/tiendas`, `/objetos`, `/partidas`, `/personajes` y `/:id`.
- `/partidas/activas`, `/personajes?idClase=...`, `/objetos/sugeridos/:idPersonaje`.
- `/sesiones` y `/sesiones/:idPartida/:numSesion`; acciones POST `/jugar`, `/finalizar`, `/calificar`.
- `/misiones` y `/misiones/:idPartida/:numSesion/:numMision`; acción POST `/completar`.
- `/inventarios` y `/inventarios/:idPersonaje/:numInventario`; acción POST `/mover`. El listado solo muestra inventarios propios.
- POST `/objetos/:id/comprar`: `{ idPersonaje, numInventario, posicion }`.
- POST `/objetos/:id/vender`: `{ idPersonaje, idTienda, precio }`.

Los identificadores compuestos se fijan en la URL al editar y no se pueden cambiar. Los errores se muestran en la pantalla sin simular éxito ni perder el formulario.
