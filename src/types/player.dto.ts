/*
 Los DTOs no tienen logica, solo describen que campos viajan entre capas.
*/
export interface CrearJugadorDTO {
  idUsuario: number;  // el Usuario ya tiene que existir en la tabla usuarios
  estado: boolean;    // true = activo, false = inactivo
}

// para actualizar solo necesitamos cambiar el estado (Partial hace todo opcional)
export type ActualizarJugadorDTO = Partial<Pick<CrearJugadorDTO, 'estado'>>;

// lo que devuelve la API: incluye datos del usuario para no hacer 2 peticiones
export interface JugadorPublicoDTO {
  idUsuario: number;
  estado: boolean;
  // datos del Usuario asociado (para mostrar en el frontend)
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}