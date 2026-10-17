import type { Personaje } from '../interfaces.ts';
import { api } from './api';

const PERSONAJES_URL = '/personajes';

export interface CreateCharacterData {
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
export type CrearPersonajeData = CreateCharacterData;

export type UpdateCharacterData = Partial<Omit<CreateCharacterData, 'contrasenaPartida'>>;
export type ActualizarPersonajeData = UpdateCharacterData;

export async function getCharacters(idClase?: number): Promise<Personaje[]> {
  const path = idClase ? `${PERSONAJES_URL}?idClase=${idClase}` : PERSONAJES_URL;
  return api<Personaje[]>(path);
}
export const obtenerPersonajes = getCharacters;

export async function getCharacterById(idPersonaje: number): Promise<Personaje> {
  return api<Personaje>(`${PERSONAJES_URL}/${idPersonaje}`);
}
export const obtenerPersonajePorId = getCharacterById;

export async function createCharacter(data: CreateCharacterData): Promise<Personaje> {
  return api<Personaje>(PERSONAJES_URL, 'POST', data);
}
export const crearPersonaje = createCharacter;

export async function updateCharacter(
  idPersonaje: number,
  data: UpdateCharacterData,
): Promise<Personaje> {
  return api<Personaje>(`${PERSONAJES_URL}/${idPersonaje}`, 'PUT', data);
}
export const actualizarPersonaje = updateCharacter;

export async function deleteCharacter(idPersonaje: number): Promise<void> {
  await api<void>(`${PERSONAJES_URL}/${idPersonaje}`, 'DELETE');
}
export const eliminarPersonaje = deleteCharacter;
