# Verificación

## Automatizada

Ejecutar los comandos de [instalación](instalacion.md). Las pruebas MySQL son independientes de las unitarias.

Cobertura de integración:

- Registro con hash y perfil atómico; nickname duplicado.
- Login con cookie `HttpOnly`/`SameSite=Strict`, recuperación de sesión, logout, rechazo de contraseña incorrecta, permisos y cambio de contraseña.
- Perfiles propios: creación, cambio de estado, eliminación y rechazo con mensaje claro cuando existen datos relacionados.
- Borrado de cuenta sin dependencias y su perfil.
- CRUD de catálogos y referencias inexistentes.
- Partida pública/privada, contraseña, límite y propietario.
- Creación de personaje e inventario; rechazo de saldo elegido por cliente.
- Compra con enteros estrictos, posición válida y propiedad.
- Error inyectado después de escribir en MySQL: dinero y ubicación se recuperan mediante rollback real.
- Dos compras simultáneas del mismo objeto y dos compras a la misma posición: una sola tiene éxito.
- Venta dentro y fuera del rango 70–100 %, propiedad y doble venta.
- Inventarios: listar los propios, mover, reducir capacidad y borrar solo vacíos.
- Sesiones y misiones: CRUD, asistencia, reparto y doble finalización concurrente de misión.
- Cierre de sesión de juego, historial y karma una sola vez.

Las pruebas de frontend verifican llamadas a la API al crear, editar y eliminar usuarios; errores del servidor, protección de acciones ajenas, login, gestión de perfiles y formulario de compra. No se cuentan pruebas con dobles de base de datos como demostración de rollback.

## Recorrido manual para el equipo

Usar una base de desarrollo descartable, nunca los datos de una entrega. Estas casillas quedan para que el equipo registre su propia ejecución; no son una afirmación de que todas las combinaciones visuales estén verificadas.

- [ ] Registrar anfitrión y jugador; entrar con ambos en navegadores separados.
- [ ] Recargar la página: la sesión permanece. Cerrar sesión: una ruta protegida vuelve al login.
- [ ] Editar el perfil propio y comprobar persistencia tras recargar; provocar nickname duplicado y ver el error.
- [ ] Registrarse repitiendo mal la contraseña: la pantalla avisa y no llama al servidor.
- [ ] Registrarse con un nickname ya usado: el mensaje dice que está en uso, no «Ese registro ya existe».
- [ ] Entrar con contraseña incorrecta y con un nickname inexistente: el mensaje es el mismo en los dos casos.
- [ ] En «Mis perfiles», sumar el segundo perfil (jugador o anfitrión) y comprobar que aparece en el dashboard.
- [ ] En «Mis perfiles», cambiar la contraseña: se cierra la sesión y la nueva contraseña funciona.
- [ ] Eliminar un perfil con personajes o partidas asociadas: se rechaza con un mensaje que explica por qué.
- [ ] Crear clase, tienda para esa clase y objeto (incluido el checkbox de Objeto Único ⭐). Ver listado, detalle y edición.
- [ ] Crear partida pública y luego privada; comprobar contraseña requerida y vuelta a pública.
- [ ] Crear personaje propio en la partida; comprobar inventario 1, dinero 100 y bloqueo de cupo lleno.
- [ ] Filtrar personajes por clase y partidas activas. Ver nombre del anfitrión en partidas.
- [ ] Ver sugeridos por clase y aplicar filtros avanzados por tipo, nivel y valor máximo.
- [ ] Comprobar visibilidad del indicador ⭐ Único en el catálogo del anfitrión, en el detalle del objeto y en los sugeridos por clase.
- [ ] Comprar objeto y confirmar saldo/ubicación al recargar; verificar rechazo de compra del mismo objeto único si ya pertenece a otro personaje en la partida.
- [ ] Comprar con saldo insuficiente o en posición ocupada: rechazo con mensaje claro y sin débito.
- [ ] Crear otro inventario y mover objeto; probar mover a posición ocupada, reducir capacidad con objeto al límite o borrar ocupado: rechazo.
- [ ] Vender a 70 % y a 100 % comprobando saldo inicial y final antes de confirmar; intentar vender a tienda de otra clase, fuera de rango o repetir venta: rechazo.
- [x] Franco Testi (18/09) Crear sesión y misión; iniciar con personajes de la partida.
- [x] Franco Testi (18/09) Completar misión con suma incorrecta: rechazo; con suma correcta: crédito persistente.
- [x] Franco Testi (18/09) Repetir finalización de misión: rechazo sin recompensa duplicada.
- [x] Franco Testi (18/09) Finalizar sesión y calificar desde jugador; segunda calificación y autocalificación: rechazo.
- [ ] Probar acceso ajeno desde solicitudes HTTP, no solo ocultando botones.
- [ ] Revisar escritorio y móvil, tema claro/oscuro, navegación por teclado y errores de conexión.

## Alcance de la verificación local

Se ejecutan los builds de ambos proyectos, las suites automatizadas y pruebas en MySQL 8 con instancia y bases temporales. El navegador se usa para comprobar login, recarga y navegación/guardado de formularios. La base real del grupo no se migra ni modifica durante esta verificación.
