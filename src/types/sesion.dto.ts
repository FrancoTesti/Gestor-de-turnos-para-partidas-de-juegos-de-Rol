/* contratos de datos para el modulo sesion.
 EstadoSesion define los valores posibles de forma legible (no numeros magicos).
*/
// los tres estados posibles de una sesion
export type EstadoSesion = 'planificada' | 'en_curso' | 'finalizada';

// datos que se envian al CREAR una sesion
export interface CrearSesionDTO {
  idPartida: number;       // a que partida pertenece
  numSesion: number;       // numero de sesion dentro de la partida (1, 2, 3...)
  duracionSesion: number;  // nro estimada en minutos
  cantJugadores: number;   // cantidad de jugadores que participan
  estado: EstadoSesion;   // estado inicial (casi siempre 'planificada')
}

// datos que se envían al ACTUALIZAR una sesión (todos opcionales)
export interface ActualizarSesionDTO {
  duracionSesion?: number;
  cantJugadores?: number;
  estado?: EstadoSesion;
}

// datos que devuelve la API al leer una sesión (sin datos sensibles)
export interface SesionPublicaDTO {
  idPartida: number;
  numSesion: number;
  duracionSesion: number;
  cantJugadores: number;
  estado: EstadoSesion;
}