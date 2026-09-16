# Modelo de datos vigente

Esta página reemplaza a `ModeloDominioOLD.drawio.png`, que quedó desactualizado: no incluye
`esUnico` en Objeto ni refleja los nombres de campos que finalmente se implementaron. El diagrama
`DER_NEW.png` sigue siendo válido como vista general; lo de abajo es la versión que se corresponde
exactamente con `src/entities/` y con `SQL/rpg.sql`.

## Diagrama entidad-relación

```mermaid
erDiagram
  USUARIO ||--o| JUGADOR : "puede ser"
  USUARIO ||--o| ANFITRION : "puede ser"
  ANFITRION ||--o{ PARTIDA : organiza
  PARTIDA ||--o{ SESION : contiene
  SESION ||--o{ MISION : propone
  JUGADOR ||--o{ PERSONAJE : controla
  CLASE ||--o{ PERSONAJE : define
  PARTIDA ||--o{ PERSONAJE : reune
  PERSONAJE ||--o{ INVENTARIO : posee
  PERSONAJE ||--o{ PERSONAJE_SESION : participa
  SESION ||--o{ PERSONAJE_SESION : registra
  INVENTARIO ||--o{ OBJETO : guarda
  TIENDA ||--o{ OBJETO : ofrece
  CLASE ||--o{ TIENDA : orienta

  USUARIO {
    int idUsuario PK
    varchar nombreUsuario
    varchar nickname UK
    varchar contrasena "hash scrypt"
    varchar imagen
  }
  JUGADOR {
    int idUsuario PK "FK Usuario"
    boolean estado
  }
  ANFITRION {
    int idUsuario PK "FK Usuario"
    int cantPartidasActuales
    int karma
  }
  PARTIDA {
    int idPartida PK
    varchar nombre
    boolean estado
    int limiteJugadores
    varchar contrasena "vacía = pública"
    int idUsuarioAnfitrion FK
  }
  SESION {
    int idPartida PK "FK Partida"
    int numSesion PK
    int duracionSesion
    int cantJugadores
    int estadoSesion "0 planificada, 1 en curso, 2 finalizada"
  }
  MISION {
    int idPartida PK "FK Sesion"
    int numSesion PK "FK Sesion"
    int numMision PK
    varchar descripcion
    int dineroTotal
    int xpTotal
    int dineroOtorgadoAJugadores
    int xpOtorgadoJugadores
    int asistenciaGrupoGrande
    boolean estado "true = completada"
  }
  PERSONAJE {
    int idPersonaje PK
    varchar nombreFicticio
    varchar raza
    int xp
    int nivel
    int dinero
    int idClase FK
    int idUsuarioJugador FK
    int idPartida FK
  }
  PERSONAJE_SESION {
    int idPersonaje PK "FK Personaje"
    int idPartida PK "FK Sesion"
    int numSesion PK "FK Sesion"
    boolean dioKarma
  }
  CLASE {
    int idClase PK
    varchar nombreClase
    varchar descripcionClase
  }
  TIENDA {
    int idTienda PK
    varchar claseTienda
    varchar nombre
    int idClase FK "opcional"
  }
  INVENTARIO {
    int idPersonaje PK "FK Personaje"
    int numInventario PK
    int cantidadEspacio
  }
  OBJETO {
    int idObjeto PK
    varchar nombre
    varchar descripcion
    varchar tipoObjeto
    int valor
    int nivelObjeto
    boolean esUnico
    int posicion
    int idTienda FK "opcional"
    int idPersonaje FK "opcional, con numInventario"
    int numInventario FK "opcional"
  }
```

## Reglas que no se ven en el diagrama

- Un `Usuario` puede tener los dos perfiles a la vez, uno solo o ninguno; el registro crea el primero
  y la pantalla «Mis perfiles» permite sumar el otro.
- Un `Objeto` está en una tienda **o** en un inventario, nunca en los dos: al comprarlo se mueve la
  referencia dentro de la misma transacción.
- `posicion` es la ranura dentro del inventario y no puede repetirse en el mismo inventario.
- `karma` sube o baja con las calificaciones de los participantes; `cantPartidasActuales` se calcula
  contando las partidas activas del anfitrión, no se guarda a mano.
- Las claves compuestas (`Sesion`, `Mision`, `Inventario`, `PersonajeSesion`) se fijan al crear el
  registro y no se modifican al editar: viajan en la URL.

## Correspondencia con el SQL

`SQL/rpg.sql` crea estas mismas tablas. Para ver el SQL que MikroORM generaría a partir de las
entidades y compararlo con ese archivo (no se conecta a la base):

```bash
npm run schema:dump
```
