
// datos para registrar a un Usuario como Anfitrion
export interface CrearAnfitrionDTO {
  idUsuario: number;          // el Usuario ya tiene que existir
  cantPartidasActuales: number; // empieza en 0
  karma: number;              // empieza en 0
}

// para actualizar solo los campos propios del Anfitrion (no el idUsuario)
export type ActualizarAnfitrionDTO = Partial<Pick<CrearAnfitrionDTO, 'cantPartidasActuales' | 'karma'>>;

// Lo que devuelve la API al frontend
export interface AnfitrionPublicoDTO {
  idUsuario: number;
  cantPartidasActuales: number;
  karma: number;
  // datos del Usuario asociado
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}