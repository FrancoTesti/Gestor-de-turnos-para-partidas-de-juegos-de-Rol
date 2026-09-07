/* llama a la API del backend para el módulo Sesión.
 Mismo patrón que los otros services del frontend. */

const API = 'http://localhost:3000/api/sesiones';

// tipo que refleja el DTO público que devuelve el backend
export interface SesionPublica {
  idPartida: number;
  numSesion: number;
  duracionSesion: number;
  cantJugadores: number;
  estado: 'planificada' | 'en_curso' | 'finalizada';
}

// helper: lanza un error con el mensaje del backend si la respuesta no es ok
async function procesarRespuesta<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// trae todas las sesiones de una partida
export async function obtenerSesionesPorPartida(idPartida: number): Promise<SesionPublica[]> {
  const res = await fetch(`${API}?idPartida=${idPartida}`);
  return procesarRespuesta<SesionPublica[]>(res);
}

// trae una sesion especifica de una partida
export async function obtenerSesion(idPartida: number, numSesion: number): Promise<SesionPublica> {
  const res = await fetch(`${API}/${idPartida}/${numSesion}`);
  return procesarRespuesta<SesionPublica>(res);
}

// crea una nueva sesión 
export async function crearSesion(data: Omit<SesionPublica, never>): Promise<SesionPublica> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<SesionPublica>(res);
}

// actualiza una sesión (por ejemplo cambiar estado)
export async function actualizarSesion(
  idPartida: number,
  numSesion: number,
  data: Partial<Pick<SesionPublica, 'duracionSesion' | 'cantJugadores' | 'estado'>>,
): Promise<SesionPublica> {
  const res = await fetch(`${API}/${idPartida}/${numSesion}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<SesionPublica>(res);
}

// elimina una sesión
export async function eliminarSesion(idPartida: number, numSesion: number): Promise<void> {
  const res = await fetch(`${API}/${idPartida}/${numSesion}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }
}

// un personaje da karma al anfitrión de la sesión
export async function darKarma(
  idPartida: number,
  numSesion: number,
  idPersonaje: number,
): Promise<void> {
  const res = await fetch(`${API}/${idPartida}/${numSesion}/karma`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idPersonaje }),
  });
  return procesarRespuesta<void>(res);
}

// trae los ids de los personajes que participan en la sesión
export async function obtenerParticipantes(idPartida: number, numSesion: number): Promise<number[]> {
  const res = await fetch(`${API}/${idPartida}/${numSesion}/participantes`);
  return procesarRespuesta<number[]>(res);
}

// registra un personaje como participante de la sesión
export async function agregarParticipante(
  idPartida: number,
  numSesion: number,
  idPersonaje: number,
): Promise<void> {
  const res = await fetch(`${API}/${idPartida}/${numSesion}/participantes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idPersonaje }),
  });
  return procesarRespuesta<void>(res);
}