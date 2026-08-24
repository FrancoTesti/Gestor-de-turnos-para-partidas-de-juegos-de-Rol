import type { Personaje } from '../interfaces.ts';

const PERSONAJES_URL = '/api/personajes';

export interface CrearPersonajeData {
  nombreFicticio: string;
  raza: string;
  idClase: number;
  idUsuarioJugador: number;
  idPartida: number;
  xp?: number;
  nivel?: number;
  dinero?: number;
}

export type ActualizarPersonajeData = Partial<CrearPersonajeData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

export async function obtenerPersonajes(idClase?: number): Promise<Personaje[]> {
  const url = idClase ? `${PERSONAJES_URL}?idClase=${idClase}` : PERSONAJES_URL;
  const respuesta = await fetch(url);
  return procesarRespuesta<Personaje[]>(respuesta);
}

export async function obtenerPersonajePorId(idPersonaje: number): Promise<Personaje> {
  const respuesta = await fetch(`${PERSONAJES_URL}/${idPersonaje}`);
  return procesarRespuesta<Personaje>(respuesta);
}

export async function crearPersonaje(data: CrearPersonajeData): Promise<Personaje> {
  const respuesta = await fetch(PERSONAJES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Personaje>(respuesta);
}

export async function actualizarPersonaje(
  idPersonaje: number,
  data: ActualizarPersonajeData,
): Promise<Personaje> {
  const respuesta = await fetch(`${PERSONAJES_URL}/${idPersonaje}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Personaje>(respuesta);
}

export async function eliminarPersonaje(idPersonaje: number): Promise<void> {
  const respuesta = await fetch(`${PERSONAJES_URL}/${idPersonaje}`, {
    method: 'DELETE',
  });
  if (!respuesta.ok) {
    await procesarRespuesta<never>(respuesta);
  }
}
