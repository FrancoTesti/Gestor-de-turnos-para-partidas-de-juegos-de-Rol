const PARTIDAS_URL = '/api/partidas';

export type EstadoPartida = 'activa' | 'finalizada';

export interface PartidaPublica {
  idPartida: number;
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;
  esPrivada: boolean;
  idUsuarioAnfitrion: number;
  nicknameAnfitrion: string;
}

export interface CrearPartidaData {
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;
  esPrivada: boolean;
  contrasena?: string;
  idUsuarioAnfitrion: number;
}

export type ActualizarPartidaData = Partial<CrearPartidaData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

export async function obtenerPartidas(): Promise<PartidaPublica[]> {
  return procesarRespuesta<PartidaPublica[]>(await fetch(PARTIDAS_URL));
}

export async function obtenerPartidasActivas(): Promise<PartidaPublica[]> {
  return procesarRespuesta<PartidaPublica[]>(await fetch(`${PARTIDAS_URL}/activas`));
}

export async function obtenerPartidaPorId(idPartida: number): Promise<PartidaPublica> {
  return procesarRespuesta<PartidaPublica>(await fetch(`${PARTIDAS_URL}/${idPartida}`));
}

export async function crearPartida(datos: CrearPartidaData): Promise<PartidaPublica> {
  const respuesta = await fetch(PARTIDAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  return procesarRespuesta<PartidaPublica>(respuesta);
}

export async function actualizarPartida(idPartida: number, datos: ActualizarPartidaData): Promise<PartidaPublica> {
  const respuesta = await fetch(`${PARTIDAS_URL}/${idPartida}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  return procesarRespuesta<PartidaPublica>(respuesta);
}

export async function eliminarPartida(idPartida: number): Promise<void> {
  const respuesta = await fetch(`${PARTIDAS_URL}/${idPartida}`, { method: 'DELETE' });
  if (!respuesta.ok) await procesarRespuesta<never>(respuesta);
}
