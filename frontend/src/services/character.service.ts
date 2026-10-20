import type { Personaje } from '../interfaces.ts';
import { api } from './api';

const PERSONAJES_URL = '/personajes';

export interface CreateCharacterData {
  nombreFicticio: string;
  raza: string;
  idClase: number;
  idUsuarioJugador: number;
  idPartida: number;
  contrasenaPartida?: string;
}

export type UpdateCharacterData = Partial<Pick<CreateCharacterData, 'nombreFicticio' | 'raza' | 'idClase'>>;

export async function getCharacters(idClase?: number): Promise<Personaje[]> {
  const path = idClase ? `${PERSONAJES_URL}?idClase=${idClase}` : PERSONAJES_URL;
  return api<Personaje[]>(path);
}

export async function createCharacter(data: CreateCharacterData): Promise<Personaje> {
  return api<Personaje>(PERSONAJES_URL, 'POST', data);
}

export async function updateCharacter(
  idPersonaje: number,
  data: UpdateCharacterData,
): Promise<Personaje> {
  return api<Personaje>(`${PERSONAJES_URL}/${idPersonaje}`, 'PUT', data);
}

export async function deleteCharacter(idPersonaje: number): Promise<void> {
  await api<void>(`${PERSONAJES_URL}/${idPersonaje}`, 'DELETE');
}
