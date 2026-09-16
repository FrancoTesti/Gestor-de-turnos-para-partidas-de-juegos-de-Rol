# Propuesta TP DSW

## Grupo
### Integrantes
53958 - Gudiño, Octavio Alejandro <br>
54241 - Salomon, Emanuel <br> 
54279 - Scollo, Renzo <br>
54307 - Testi, Franco  <br> 
54342 - Ciesco, Alejandro Mario <br>

### Repositorios
Backend y frontend viven en el mismo repositorio:

* [Repositorio completo](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol)
* [Backend](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/tree/main/src) (`src/`, Express + MikroORM)
* [Frontend](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/tree/main/frontend) (`frontend/`, React + Vite)
* [Documentación](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/blob/main/docs/README.md)

## Tema
### Descripción
Trata de un gestor de turnos para partidas de juegos de Rol, con sistema de compra-venta de objetos del juego en las partidas, con registro y logueo tanto para “Jugador” como “Anfitrión” y sistema para crear personajes de rol.

### Modelo
El modelo vigente, entidad por entidad y con las reglas que no se ven en el diagrama, está en
[docs/modelo.md](docs/modelo.md). El diagrama entidad-relación actualizado es este:

![Diagrama entidad-relación del sistema](docs/DER_NEW.png)

La versión conceptual original se conserva como historial en `docs/ModeloDominioOLD.drawio.png`
([enlace al Drive](https://drive.google.com/file/d/1-zXEpOdd3ASk3xKuXXNHCWMKxyeTyydU/view?usp=sharing));
quedó desactualizada respecto de lo implementado.



## 𝘼𝙡𝙘𝙖𝙣𝙘𝙚 𝙁𝙪𝙣𝙘𝙞𝙤𝙣𝙖𝙡 

### 𝘼𝙡𝙘𝙖𝙣𝙘𝙚 𝙈𝙞́𝙣𝙞𝙢𝙤

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Objeto<br>3. CRUD Tienda <br>4. CRUD Misión <br>5. CRUD Clase |
|CRUD dependiente|1. CRUD Personaje {Depende de} CRUD Jugador<br>2. CRUD Jugador {Depende de} CRUD Usuario. <br>3. CRUD Anfitrion {Depende de} CRUD Usuario |
|Listado<br>+<br>detalle|1. Listado de partidas filtrado por estado (activo), muestra nombre de la partida, su privacidad y anfitrión => detalle de todas las partidas que están siendo hosteadas. <br> 2. Listado de objetos sugeridos filtrado por clase de personaje, muestra nombre del objeto, tipo, valor => detalle de los objetos que se pueden comprar y coinciden con mi clase. <br> 3. Listado de personajes filtrado por clase, muestra nombre del personaje, jugador asociado, xp, nivel, raza y el id del personaje => detalle de los personajes que poseen el clase elegido. Si no se elige: cualquiera.|
|CUU/Epic|1. Jugar una sesión<br>2. Gestionar comercialización de objetos <br>3. Realizar misión|



Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Usuario<br>2. CRUD Objeto <br>3. CRUD Partida <br>4. CRUD Tienda<br>5. CRUD Misión<br>6. CRUD Personaje<br>7. CRUD Jugador <br>8. CRUD Sesión <br>9. CRUD Anfitrión <br>10. CRUD Inventario|
|CUU/Epic|1. Gestionar inventario<br>2. Calificar anfitrión<br>3. Crear personaje <br>4. Gestionar partida <br>5. Actualizar usuario |


### 𝘼𝙡𝙘𝙖𝙣𝙘𝙚 𝘼𝙙𝙞𝙘𝙞𝙤𝙣𝙖𝙡 𝙑𝙤𝙡𝙪𝙣𝙩𝙖𝙧𝙞𝙤

|Req|Detalle|
|:-|:-|
|Listados |1. |
|CUU/Epic|1. <br>2. |
|Otros|1. |

## Estado de lo implementado

El alcance mínimo y los adicionales para aprobación están implementados de punta a punta
(interfaz → API → MySQL) y cada requisito tiene su prueba asociada en la matriz de
[docs/entrega.md](docs/entrega.md), que también registra lo que queda parcial: la revisión responsive
y de accesibilidad todavía no recorrió todas las pantallas. Las reglas de negocio están en
[docs/funcionalidad.md](docs/funcionalidad.md) y los endpoints, en [docs/api.md](docs/api.md).

El alcance adicional voluntario quedó vacío a propósito: el grupo priorizó cerrar el alcance de
aprobación con pruebas automáticas antes que sumar funciones nuevas.
