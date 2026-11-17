export interface CrearPersonajeDTO {
  nombreFicticio: string;
  raza: string;
  idClase: number;
  idUsuarioJugador: number;
  idPartida: number;
  contrasenaPartida?: string;
}

export interface ActualizarPersonajeDTO {
  nombreFicticio?: string;
  raza?: string;
  idClase?: number;
}

export interface PersonajePublicoDTO {
  idPersonaje: number;
  nombreFicticio: string;
  raza: string;
  xp: number;
  nivel: number;
  dinero: number;
  idClase: number;
  claseNombre?: string;
  idUsuarioJugador: number;
  jugadorNombre?: string;
  idPartida: number;
  partidaNombre?: string;
}
