/* uso un union type para el estado: más claro que true/false
"activa" = la partida está en curso, "finalizada" = termino */
export type EstadoPartida = 'activa' | 'finalizada';

// datos para crear una Partida nueva
export interface CrearPartidaDTO {
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;  // debe ser > 0 (se valida en el validator)
  esPrivada: boolean;       // true = requiere contraseña, false = pública
  contrasena?: string;      // solo obligatoria si esPrivada === true
  idUsuarioAnfitrion: number; // el Anfitrion ya tiene que existir
}

//para actualizar: todos los campos son opcionales
export type ActualizarPartidaDTO = Partial<CrearPartidaDTO>;

// Lo que devuelve la API al frontend (incluye el nickname del anfitrion)
export interface PartidaPublicaDTO {
  idPartida: number;
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;
  esPrivada: boolean;
  /* Cuando un jugador quiere unirse, el frontend le muestra un formulario para que la escriba, y es 
  el Backend quien verifica si esa clave coincide con el hash guardado mediante verifyPassword() */
  idUsuarioAnfitrion: number;
  nicknameAnfitrion: string; // para mostrar en el listado sin hacer otra petición
}