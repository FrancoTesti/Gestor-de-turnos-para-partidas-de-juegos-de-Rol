// interfaces.ts — Modelo de datos relacional (Modelo B)
// Cada interface representa una TABLA. Las relaciones se hacen por ID (clave foránea).
// La contraseña se unifica como "contrasena" (sin ñ ni tilde) en TODO el proyecto.
//
// Notación del esquema:
//   CP = Clave Primaria | CF = Clave Foránea | NN = Not Null (obligatorio)
//   Una CF sin NN es opcional -> se modela como "number | null".

export interface Usuario {
  idUsuario: number;        // CP
  nombreUsuario: string;
  contrasenia: string;
  imagen: string;           // link a la imagen
  nickname: string;
  datosJugador?: {
    estado: boolean;
  };
  datosAnfitrion?: {
    cantPartidasActuales: number;
    karma: number;
  }
}
export interface Partida {
  idPartida: number;        // CP
  nombre: string;
  estado: boolean;
  limiteJugadores: number;
  contrasenia: string;
  idUsuario_Anfitrion: number; // CF -> Anfitrion(idUsuario) NN
}

export interface Sesion {
  idPartida: number;        // CP, y CF -> Partida(idPartida) NN
  numSesion: number;        // CP
  duracionSesion: number;
  cantJugadores: number;
  estadoSesion: number;     // 1 = en curso, 2 = finalizada
}

export interface Mision {
  idPartida: number;        // CP, y CF -> Sesion(idPartida, numSesion) NN
  numSesion: number;        // CP, y CF -> Sesion(idPartida, numSesion) NN
  numMision: number;        // CP
  descripcion: string;
  dineroTotal: number;
  xpTotal: number;
  xpOtorgadoJugadores: number;
  dineroOtorgadoAJugadores: number;
  asistenciaGrupoGrande: number;
  estado: boolean;          // true = completada
}

export interface Clase {
  idClase: number;          // CP
  nombreClase: string;
  descripcionClase: string;
}

export interface Tienda {
  idTienda: number;         // CP
  claseTienda: string;
  nombre: string;
  idClase: number | null;   // CF -> Clase(idClase) (opcional)
}

export interface Personaje {
  idPersonaje: number;      // CP
  nombreFicticio: string;
  raza: string;
  xp: number;
  nivel: number;
  dinero: number;
  idClase: number;          // CF -> Clase(idClase) NN
  idUsuario_Jugador: number; // CF -> Jugador(idUsuario) NN
  idPartida: number;        // CF -> Partida(idPartida) NN
}

export interface Inventario {
  idPersonaje: number;      // CP, y CF -> Personaje(idPersonaje) NN
  numInventario: number;    // CP
  cantidadEspacio: number;
}

export interface Personaje_Sesion {
  idPersonaje: number;      // CP, y CF -> Personaje(idPersonaje) NN
  idPartida: number;        // CP, y CF -> Sesion(idPartida, numSesion) NN
  numSesion: number;        // CP, y CF -> Sesion(idPartida, numSesion) NN
  dioKarma: boolean;
}

export interface Objeto {
  idObjeto: number;         // CP
  valor: number;
  descripcion: string;
  nombre: string;
  nivelObjeto: number;
  tipoObjeto: string;
  idTienda: number | null;      // CF -> Tienda(idTienda) (opcional)
  idPersonaje: number | null;   // CF -> Inventario(idPersonaje, numInventario) (opcional)
  numInventario: number | null; // CF -> Inventario(idPersonaje, numInventario) (opcional)
  posicion: number;
}