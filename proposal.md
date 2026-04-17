#Propuesta TP DSW <br>
#Integrantes <br>
53958 - Gudiño, Octavio Alejandro <br>
54241 - Salomon, Emanuel <br> 
54279 - Scollo, Renzo <br>
54307 - Testi, Franco  <br> 
54342 - Ciesco, Alejandro Mario<br>

#Repositorios<br>
frontend app<br>
backend app <br>

#Tema
#Descripción
Trata de un gestor de turnos para partidas de juegos de Rol, con sistema de compra-venta de objetos del juego en las partidas, con registro y logueo tanto para “Jugador” como “Anfitrión” y sistema para crear personajes de rol.

Modelo
LINK:https://drive.google.com/file/d/1-zXEpOdd3ASk3xKuXXNHCWMKxyeTyydU/view?usp=sharing
![Texto alternativo](ModeloDominio.drawio.png)



## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Objeto<br>3. CRUD Tienda <br>4. CRUD Misión |
|CRUD dependiente|1. CRUD Personaje {Depende de} CRUD Jugador<br>2. CRUD Jugador {Depende de} CRUD Usuario. <br>3. |
|Listado<br>+<br>detalle|1. Listado de partidas filtrado por estado (activo), muestra nombre de la partida, su privacidad y anfitrión => detalle de todas las partidas que están siendo hosteadas. <br> 2. Listado de objetos sugeridos filtrado por clase de personaje, muestra nombre del objeto, tipo, valor y si es único => detalle de los objetos que se pueden comprar y coinciden con mi clase. <br> 3. Listado de personajes filtrado por clase, muestra nombre del personaje, jugador asociado, xp, nivel, raza y el id del personaje => detalle de los personajes que poseen el clase elegido. Si no se elige: cualquiera.|
|CUU/Epic|1. Jugar una sesión<br>2. Gestionar comercialización de objetos <br>3. Realizar misión|



Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Usuario<br>2. CRUD Objeto <br>3. CRUD Partida <br>4. CRUD Tienda<br>5. CRUD Misión<br>6. CRUD Personaje<br>7. CRUD Jugador <br>8.CRUD Sesión <br>9. CRUD Anfitrión <br>10. CRUD Inventario|
|CUU/Epic|1. Gestionar inventario<br>2. Calificar anfitrión<br>3. Realizar el check-out y facturación de estadía y servicios|


### Alcance Adicional Voluntario

*Nota*: El Alcance Adicional Voluntario es opcional, pero ayuda a que la funcionalidad del sistema esté completa y será considerado en la nota en función de su complejidad y esfuerzo.

|Req|Detalle|
|:-|:-|
|Listados |1. Estadía del día filtrado por fecha muestra, cliente, habitaciones y estado <br>2. Reservas filtradas por cliente muestra datos del cliente y de cada reserve fechas, estado cantidad de habitaciones y huespedes|
|CUU/Epic|1. Consumir servicios<br>2. Cancelación de reserva|
|Otros|1. Envío de recordatorio de reserva por email|

