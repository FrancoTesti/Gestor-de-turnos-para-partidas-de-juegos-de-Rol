# Verificación

## Automatizada

Ejecutar los comandos de [instalación](instalacion.md). Las pruebas de integración con PostgreSQL son independientes de las unitarias.

Cobertura de integración:

- Registro con hash y perfil atómico; nickname duplicado.
- Login con cookie `HttpOnly`/`SameSite=Strict`, recuperación de sesión, logout, rechazo de contraseña incorrecta, permisos y cambio de contraseña.
- Perfiles propios: creación, cambio de estado, eliminación y rechazo con mensaje claro cuando existen datos relacionados.
- Borrado de cuenta sin dependencias y su perfil.
- CRUD de catálogos y referencias inexistentes.
- Partida pública/privada, contraseña, límite y propietario.
- Creación de personaje e inventario; rechazo de saldo elegido por cliente.
- Compra con enteros estrictos, posición válida y propiedad.
- Error inyectado después de escribir en la base: dinero y ubicación se recuperan mediante rollback real.
- Dos compras simultáneas del mismo objeto y dos compras a la misma posición: una sola tiene éxito.
- Venta dentro y fuera del rango 70–100 %, propiedad y doble venta.
- Inventarios: listar los propios, mover, reducir capacidad y borrar solo vacíos.
- Sesiones y misiones: CRUD, asistencia, reparto y doble finalización concurrente de misión.
- Cierre de sesión de juego, historial y karma una sola vez.

Las pruebas de frontend verifican llamadas a la API al crear, editar y eliminar usuarios; errores del servidor, protección de acciones ajenas, login, gestión de perfiles y formulario de compra. No se cuentan pruebas con dobles de base de datos como demostración de rollback.

## Recorrido manual para el equipo

Usar una base de desarrollo descartable, nunca los datos de una entrega. Estas casillas quedan para que el equipo registre su propia ejecución; no son una afirmación de que todas las combinaciones visuales estén verificadas.

- [X] Registrar anfitrión y jugador; entrar con ambos en navegadores separados. — *a cargo de Emanuel Salomón, [prueba C1](#c1)*
**Correcto, enviado al grupo.**
- [X] Recargar la página: la sesión permanece. Cerrar sesión: una ruta protegida vuelve al login. — *a cargo de Emanuel Salomón, [prueba C2](#c2)*
**Correcto, adjunto en chat personal.**
- [X] Editar el perfil propio y comprobar persistencia tras recargar; provocar nickname duplicado y ver el error. — *a cargo de Emanuel Salomón, [prueba C3](#c3)*
- [X] Registrarse repitiendo mal la contraseña: la pantalla avisa y no llama al servidor. — *a cargo de Emanuel Salomón, [prueba C4](#c4)*
- [X] Registrarse con un nickname ya usado: el mensaje dice que está en uso, no «Ese registro ya existe». — *a cargo de Emanuel Salomón, [prueba C5](#c5)*
Se encontró un bug en base a eso, ver C5.1.
- [ ] Si la cuenta no se crea, entonces que no se renderice el mensaje de "Cuenta creada, ya puedes iniciar sesión". Para desarrollo, luego probar. [prueba C5.1](#c5.1)
- [X] Entrar con contraseña incorrecta y con un nickname inexistente: el mensaje es el mismo en los dos casos. — *a cargo de Emanuel Salomón, [prueba C6](#c6)*
- [X] En «Mis perfiles», sumar el segundo perfil (jugador o anfitrión) y comprobar que aparece en el dashboard. — *a cargo de Emanuel Salomón, [prueba C7](#c7)*
Este lo testeé de antes, y sí, funciona.
- [X] En «Mis perfiles», cambiar la contraseña: se cierra la sesión y la nueva contraseña funciona. — *a cargo de Emanuel Salomón, [prueba C8](#c8)*
- [X] Eliminar un perfil con personajes o partidas asociadas: se rechaza con un mensaje que explica por qué. — *a cargo de Emanuel Salomón, [prueba C9](#c9)*
- [x] Alejandro Ciesco (28/09) Crear clase y tienda asociada a una clase/partida; verificar persistencia en base de datos, listado, detalle y edición (`/api/clases` y `/api/tiendas`).
- [x] Alejandro Ciesco (28/09) Crear personaje propio en la partida (`/api/personajes`); comprobar creación automática de `Inventario` #1 (10 espacios), `dinero: 100`, `xp: 0`, `nivel: 1`, bloqueo por cupo lleno y protección de baja con historial u objetos.
- [x] Alejandro Ciesco (28/09) Filtrar personajes por clase (`GET /api/personajes?idClase=`) y limpiar filtro.
- [x] Octavio Gudiño (25/09) En Frontend (`ShopsPage`, `ItemsPage`, `ClassesPage`, `CharactersPage`): ver objetos sugeridos por clase y aplicar filtros interactivos por tipo, nivel y valor máximo.
- [x] Octavio Gudiño (25/09) En Frontend (`ItemList`, `ItemDetail`, `ItemForm`): comprobar visibilidad del indicador ⭐ Único en el catálogo del anfitrión, en el detalle del objeto y en los sugeridos por clase.
- [x] Octavio Gudiño (25/09) En Frontend (`PurchaseItemForm`): comprar objeto eligiendo personaje, inventario y ranura; confirmar actualización de saldo/ubicación y visualización de error ante objeto único ya adquirido o nivel insuficiente.
- [x] Octavio Gudiño (25/09) En Frontend (`PurchaseItemForm`): intentar comprar con saldo insuficiente o en posición ocupada y comprobar alerta clara sin débito.
- [x] Octavio Gudiño (25/09) En Frontend (`ModulePage`): crear segundo inventario y mover objeto entre casilleros; probar rechazo al mover a posición ocupada, reducir capacidad ocupada o borrar inventario con objetos.
- [x] Octavio Gudiño (25/09) En Frontend (`SaleItemForm`): vender a 70 % y a 100 % comprobando cálculo interactivo de rango y saldo final; verificar rechazo fuera de rango o en tienda de otra clase.
- [x] Franco Testi (18/09) Crear partida pública y luego privada con contraseña; iniciar sesión de juego (`/jugar`) y misión (`/misiones`) con personajes de la partida.
- [x] Franco Testi (18/09) Completar misión (`/completar`) con suma incorrecta: rechazo; con suma exacta: acreditación transaccional persistente.
- [x] Franco Testi (18/09) Repetir finalización de misión y compras/ventas concurrentes: bloqueo pesimista (`FOR UPDATE`) sin duplicación.
- [x] Franco Testi (18/09) Finalizar sesión (`/finalizar`) y calificar karma del anfitrión (`/calificar`); segunda calificación y autocalificación: rechazo.
- [x] Renzo Scollo (24/09) Probar navegación protegida (`MainLayout`, `UserContext`, `api.ts` ante `401`) y vistas de `LoginPage`, `RegisterPage`, `ProfilesPage`, `UsersPage`, `SessionsPage`, `MissionsPage` y `NotFoundPage`.
- [x] Renzo Scollo (08/10) Revisar escritorio y móvil (375, 768 y 1280 px), tema claro/oscuro (`ThemeContext`), accesibilidad WCAG 2 AA (`axe-core`) y errores de conexión.

Al terminar cada casilla, marcarla con el mismo formato que las ya ejecutadas:
`- [x] Nombre Apellido (DD/MM) texto de la casilla`. Si algo no da lo esperado, dejar la casilla
sin marcar y anotar el defecto en [seguimiento.md](seguimiento.md).

## Guía paso a paso: cuentas y perfiles (Emanuel Salomón)

Cada prueba dice qué hacer y qué **debería** pasar. La prueba se aprueba solo si pasa exactamente
eso; si aparece otra cosa (otro mensaje, un error, una pantalla en blanco), es un hallazgo: se anota
en `seguimiento.md` con lo que se hizo y lo que se vio, aunque parezca menor.

### Preparación (una sola vez)

1. Base de desarrollo descartable, con las tablas creadas (`npm run schema:create` sobre una base
   vacía, ver [instalacion.md](instalacion.md)).
2. Backend (`npm run dev`) y frontend (`cd frontend`, `npm run dev`) corriendo.
3. `npm run demo:datos` para tener `dm_demo` y `jugador_demo` (contraseña `PruebaSegura123`).
4. Hacer una copia de la base ([respaldo.md](respaldo.md)): después de la prueba C8 conviene
   restaurarla.
5. Dos ventanas: una normal y una de incógnito. Cada una tiene su propia cookie, así que en cada
   una puede haber una cuenta distinta.
6. Para las pruebas que dicen «sin llamar al servidor»: abrir las herramientas del navegador
   (`F12`), pestaña **Red** (Network), y dejarla abierta mientras se prueba.

<a id="c1"></a>

### C1. Registrar anfitrión y jugador y entrar con los dos

1. Ventana normal: `/register`, registrar `qa_anfitrion` con tipo **Anfitrión** y una contraseña
   de 6 caracteres o más, repetida igual.
2. Ventana de incógnito: `/register`, registrar `qa_jugador` con tipo **Jugador**.
3. Entrar con cada cuenta en su ventana.

**Esperado:** después de «Registrar» se pasa a la pantalla de login. Las dos cuentas entran y cada
ventana muestra su propio usuario: entrar en una no cierra la sesión de la otra. En «Perfiles»,
`qa_anfitrion` tiene perfil de anfitrión y `qa_jugador`, perfil de jugador.

<a id="c2"></a>

### C2. La sesión sobrevive a la recarga y el cierre de sesión protege las rutas

1. Con una cuenta adentro, apretar `F5`.
2. Apretar **Cerrar Sesión**.
3. Escribir a mano en la barra de direcciones `http://localhost:5173/profiles`.

**Esperado:** con `F5` se sigue adentro, sin volver a pedir login. Después de cerrar sesión, la
dirección `/profiles` lleva al login y no muestra datos de la cuenta.

<a id="c3"></a>

### C3. Editar los datos propios y nickname duplicado

1. Entrar como `qa_jugador`. **Perfiles** → **Editar mis datos**.
2. Cambiar el nombre (por ejemplo, agregar « QA») y dejar la contraseña vacía. **Actualizar**.
3. Apretar `F5`.
4. Otra vez **Editar mis datos**, poner de nickname `dm_demo` y **Actualizar**.

**Esperado:** en el paso 2 aparece «Datos de la cuenta actualizados.» y se ve el nombre nuevo. Con
`F5` el nombre nuevo sigue ahí (quedó guardado en la base, no solo en pantalla). En el paso 4
aparece un error que dice que el nickname ya está en uso y el nickname no cambia.

<a id="c4"></a>

### C4. Contraseña repetida mal en el registro

1. `/register`, completar todo bien salvo «Repetir contraseña», que va distinta. **Registrar**.

**Esperado:** aparece «Las dos contraseñas no coinciden.» y se sigue en el registro. En la pestaña
**Red** **no** aparece ninguna solicitud `register`: la pantalla frenó el envío. La cuenta no se
crea (se puede comprobar intentando entrar con ese nickname: no deja).

<a id="c5"></a>

### C5. Registrarse con un nickname que ya existe

1. `/register` con nickname `dm_demo` y el resto de los datos válidos. **Registrar**.

**Esperado:** aparece «Ese nickname ya está en uso. Elegí otro para poder iniciar sesión.». No debe
aparecer el texto genérico «Ese registro ya existe».

<a id="c6"></a>

### C6. Mismo mensaje para contraseña incorrecta y usuario inexistente

1. `/login` con `dm_demo` y una contraseña equivocada.
2. `/login` con un nickname que no existe, por ejemplo `nadie_existe_123`.

**Esperado:** los dos intentos muestran exactamente «Usuario o contraseña incorrecta». El mensaje no
debe dar pistas de si el usuario existe.

<a id="c7"></a>

### C7. Sumar el segundo perfil

1. Entrar como `qa_jugador`. En el **Dashboard**, anotar el número de «Anfitriones» en
   Estadísticas.
2. **Perfiles** → tarjeta Anfitrión → **Crear perfil de anfitrión**.
3. Volver al **Dashboard**.

**Esperado:** aparece «Perfil de anfitrión creado.» y la tarjeta Anfitrión pasa a mostrar «Karma: 0.
Partidas activas: 0». En el Dashboard el contador de Anfitriones subió en 1.

**A mirar con atención:** hoy el campo «Rol» del Dashboard muestra un solo perfil (`anfitrion`
cuando la cuenta tiene los dos). Decidir si eso cumple «aparece en el dashboard»; si no, anotarlo
en `seguimiento.md` como hallazgo.

<a id="c8"></a>

### C8. Cambiar la contraseña cierra la sesión

1. Entrar como `qa_jugador`. **Perfiles** → **Editar mis datos**, escribir una contraseña nueva y
   **Actualizar**.
2. Intentar entrar con la contraseña **vieja**.
3. Entrar con la contraseña **nueva**.

**Esperado:** en el paso 1 se cierra la sesión y se vuelve al login. La contraseña vieja da «Usuario
o contraseña incorrecta» y la nueva entra.

<a id="c9"></a>

### C9. No se puede eliminar un perfil con datos relacionados

1. Ventana normal, como `dm_demo`: menú **🎮 Partidas**, crear una partida pública.
2. Ventana de incógnito, como `jugador_demo`: menú **⚔️ Personajes**, crear un personaje en esa
   partida.
3. Como `jugador_demo`: **Perfiles** → **Eliminar perfil de jugador** → aceptar la confirmación.
4. Como `dm_demo`: **Perfiles** → **Eliminar perfil de anfitrión** → aceptar la confirmación.

**Esperado:** en los dos casos aparece un error que explica que hay datos relacionados («El
registro tiene datos relacionados. Resolvé esas relaciones antes de eliminarlo.») y el perfil
**sigue** en la pantalla después de `F5`. Que el perfil desaparezca sería un defecto grave.

### Al terminar

1. Marcar cada casilla aprobada arriba con nombre y fecha.
2. Anotar cada hallazgo en [seguimiento.md](seguimiento.md), aunque se haya aprobado el resto.
3. Escribir el resultado en [entrega.md](entrega.md) (cuántas aprobadas y qué hallazgos quedaron).
4. Restaurar la copia de la base si se va a grabar el video después.

## Guía paso a paso: clases, tiendas y personajes (Alejandro Ciesco)

<a id="p1"></a>

### P1. Crear clase y tienda asociada a una clase/partida

1. Entrar con cuenta de anfitrión (`dm_demo`). Ir a **🛡️ Clases** → **+ Nueva Clase** y crear una clase con nombre y descripción válidos.
2. Ir a **🏪 Tiendas** → **+ Nueva Tienda** y crear una tienda vinculada a la clase creada y a una partida activa.
3. Editar el nombre o la clase asociada de la tienda y comprobar que los cambios persisten al recargar.

**Esperado:** tanto la clase como la tienda se registran en PostgreSQL a través de `ClaseService` y `TiendaService`, validando la existencia de las referencias (`ErrorValidacionTienda`) y devolviendo sus respectivos DTOs públicos.

<a id="p2"></a>

### P2. Crear personaje propio en la partida; inicialización de Inventario #1 y control de cupo

1. Entrar con cuenta de jugador (`jugador_demo`). Ir a **⚔️ Personajes** → **+ Nuevo Personaje**.
2. Seleccionar una clase (ej. Guerrero), una partida activa y completar nombre «Thorin» y raza «Enano». Guardar.
3. Verificar en el listado y detalle que el personaje inicia con `dinero: 100`, `xp: 0`, `nivel: 1` e `Inventario` número 1 con capacidad de 10 casillas.
4. Intentar crear un segundo personaje con el mismo jugador en la misma partida: se rechaza con error («Ya tenés un personaje en esta partida»).
5. Intentar borrar un personaje que posea objetos en su inventario o historial en `PersonajeSesion`: se rechaza con conflicto (`409`).

**Esperado:** `PersonajeService` crea el personaje y su `Inventario` #1 de forma atómica, inicializando sus atributos base y aplicando las restricciones de cupo, clave de partida privada y baja segura.

<a id="p3"></a>

### P3. Filtrar personajes por clase y tiendas por partida

1. En **⚔️ Personajes**, seleccionar el filtro por clase en el desplegable (`GET /api/personajes?idClase=`).
2. Comprobar que la lista se actualiza mostrando únicamente los personajes de esa clase y que el botón para limpiar filtro restablece el listado completo.
3. En **🏪 Tiendas**, comprobar el listado general y el filtrado por partida (`GET /api/tiendas?idPartida=`), verificando la carga de relaciones mediante `populate: ['clase', 'partida']`.

**Esperado:** el filtrado por clase en `PersonajeService` y por partida en `TiendaService` devuelve únicamente los registros coincidentes con sus relaciones pobladas en el DTO.

## Alcance de la verificación local

Se ejecutan los builds de ambos proyectos, las suites automatizadas y pruebas en PostgreSQL con esquemas temporales (`rpg_test_*`, `rpg_e2e_*`), que se eliminan al terminar. El navegador se usa para comprobar login, recarga y navegación/guardado de formularios. Las suites nunca modifican el esquema `public` de la base real del grupo.
