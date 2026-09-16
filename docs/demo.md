# Guion de demostración

Recorrido completo del sistema en unos 10 minutos, con dos roles. Sirve para la defensa oral y
como libreto del video.

## Antes de empezar

1. Base limpia: crear la base y las tablas como indica [instalacion.md](instalacion.md).
2. Backend en una terminal (`npm run dev`) y frontend en otra (`cd frontend && npm run dev`).
3. Dos ventanas del navegador: una normal para el **anfitrión** y una de incógnito para el
   **jugador**. Hacen falta dos sesiones distintas porque la cookie es por navegador.
4. Tener a mano estas credenciales: `dm_demo` / `PruebaSegura123` y `jugador_demo` / `PruebaSegura123`.

Si algo falla en vivo, mostrar el mensaje de error real: el sistema nunca simula éxito, y eso
también es parte de lo que se evalúa.

## Recorrido

| # | Paso | Dónde | Qué se muestra |
| --- | --- | --- | --- |
| 1 | Registrar `dm_demo` como **Anfitrión** | `/register` | Validación de contraseña repetida y de nickname único |
| 2 | Registrar `jugador_demo` como **Jugador** (ventana de incógnito) | `/register` | El tipo de cuenta crea el perfil correspondiente |
| 3 | Intentar registrar otra vez `dm_demo` | `/register` | Mensaje «Ese nickname ya está en uso» |
| 4 | Entrar con contraseña equivocada | `/login` | «Usuario o contraseña incorrecta», sin pistas sobre si el usuario existe |
| 5 | Entrar bien y recargar la página (F5) | `/dashboard` | La sesión se recupera con la cookie: no vuelve a pedir login |
| 6 | Mis perfiles | `/profiles` | Datos propios, perfil de jugador/anfitrión, karma calculado por el servidor |
| 7 | Crear una clase y una tienda (anfitrión) | `/classes`, `/stores` | CRUD simple con estados de carga, vacío y error |
| 8 | Crear un objeto asociado a la tienda | `/objects` | CRUD de objeto, incluido `esUnico` |
| 9 | Crear una partida | `/games` | Cupo, privacidad y contraseña de partida |
| 10 | Como jugador, crear un personaje en esa partida | `/characters` | El servidor fija dinero 100, xp 0, nivel 1 y crea el inventario |
| 11 | Filtrar personajes por clase y limpiar el filtro | `/characters` | Listado con filtro exigido por la propuesta |
| 12 | Comprar el objeto con el personaje | `/objects` | Descuento de saldo y objeto en el inventario |
| 13 | Crear la sesión 1 de la partida (anfitrión) | `/sessions` | Estado «Planificada» |
| 14 | Iniciar la sesión eligiendo al personaje | `/sessions` | Estado «En curso» y participantes registrados |
| 15 | Crear una misión con dinero y XP totales | `/missions` | CRUD de misión con clave compuesta |
| 16 | Completar la misión repartiendo las recompensas | `/missions` | Se acreditan XP y dinero en una sola transacción |
| 17 | Intentar repartir una suma distinta al total | `/missions` | Rechazo con mensaje claro |
| 18 | Finalizar la sesión | `/sessions` | No deja finalizar si quedan misiones pendientes |
| 19 | Como jugador, calificar al anfitrión | `/sessions` | Voto único: el segundo intento se rechaza |
| 20 | Ver el karma actualizado (anfitrión) | `/profiles` | «Karma: 1. Partidas activas: 1» |
| 21 | Mover el objeto de inventario y venderlo | `/inventory`, `/objects` | Rango de venta 70–100 % y saldo actualizado |
| 22 | Editar los datos propios y cambiar la contraseña | `/profiles` | Se cierra la sesión y hay que volver a entrar |
| 23 | Intentar editar la cuenta de otro usuario | `/users` | La interfaz no ofrece la acción y el servidor responde 403 |
| 24 | Cerrar sesión y volver a `/games` con la URL | — | Redirige a `/login`: las rutas privadas están protegidas |

## Qué decir en cada bloque

- **Cuentas (1–6):** contraseñas con hash scrypt, cookie HttpOnly, sesión de 8 horas, y que los
  permisos se comprueban en el servidor, no escondiendo botones.
- **Catálogo y personajes (7–12):** los cinco CRUD simples pedidos, y que el alta del personaje y su
  inventario ocurren en la misma transacción.
- **Sesión y misión (13–20):** los dos casos de uso principales, con validación de participantes,
  sumas de recompensas y voto único.
- **Comercio (21):** bloqueo pesimista en MySQL para que dos compras simultáneas no dupliquen el objeto.
- **Seguridad (22–24):** qué pasa cuando alguien intenta operar fuera de su cuenta.

## Grabar el video

- Duración objetivo: 10–12 minutos. Resolución mínima 1280×720 y zoom del navegador al 100 %.
- Herramienta sugerida: OBS Studio (gratis, Windows/Linux/Mac) o la grabadora de pantalla de Windows
  (`Win + Alt + R`). Grabar pantalla completa con audio del micrófono.
- Antes de grabar: cerrar pestañas y notificaciones, vaciar la base para partir de cero y dejar las
  dos ventanas ya abiertas lado a lado.
- **No mostrar** el archivo `.env`, contraseñas reales ni credenciales de la base. Si hay que abrir
  una terminal, usar la que solo tiene `npm run dev` corriendo.
- Cerrar con un resumen de 30 segundos: qué requisitos de la propuesta quedaron cubiertos y qué
  quedó fuera de alcance.
- Subir el video sin listar (YouTube «oculto» o Drive con enlace) y pegar el enlace en
  [entrega.md](entrega.md).
