// datos para registrar a un Usuario como Anfitrion
export interface CrearAnfitrionDTO {
  idUsuario: number;          // el Usuario ya tiene que existir
  cantPartidasActuales: number; // empieza en 0
  karma: number;              // empieza en 0
}

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
