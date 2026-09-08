import type { Personaje } from '../interfaces.ts';
import { api } from './api';

const PERSONAJES_URL = '/personajes';

export interface CrearPersonajeData {
  nombreFicticio: string;
  raza: string;
  idClase: number;
  idUsuarioJugador: number;
  idPartida: number;
  xp?: number;
  nivel?: number;
  dinero?: number;
  contrasenaPartida?: string;
}

export type ActualizarPersonajeData = Partial<Omit<CrearPersonajeData, 'contrasenaPartida'>>;

export async function obtenerPersonajes(idClase?: number): Promise<Personaje[]> {
  const path = idClase ? `${PERSONAJES_URL}?idClase=${idClase}` : PERSONAJES_URL;
  return api<Personaje[]>(path);
}

export async function obtenerPersonajePorId(idPersonaje: number): Promise<Personaje> {
  return api<Personaje>(`${PERSONAJES_URL}/${idPersonaje}`);
}

export async function crearPersonaje(data: CrearPersonajeData): Promise<Personaje> {
  return api<Personaje>(PERSONAJES_URL, 'POST', data);
}

export async function actualizarPersonaje(
  idPersonaje: number,
  data: ActualizarPersonajeData,
): Promise<Personaje> {
  return api<Personaje>(`${PERSONAJES_URL}/${idPersonaje}`, 'PUT', data);
}

export async function eliminarPersonaje(idPersonaje: number): Promise<void> {
  await api<void>(`${PERSONAJES_URL}/${idPersonaje}`, 'DELETE');
}
