import { api } from './api';
import type { Mision } from '../interfaces';

export type Recompensa = { idPersonaje: number, dinero: number, xp: number };

export function getMissions() {
  return api<Mision[]>('/misiones');
}

export function createMission(data: Partial<Mision>) {
  return api<Mision>('/misiones', 'POST', data);
}

export function completeMission(game: number, session: number, mission: number, recompensas: Recompensa[]) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}/completar`, 'POST', { recompensas });
}

export function updateMission(game: number, session: number, mission: number, data: Partial<Mision>) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}`, 'PUT', data);
}

export function deleteMission(game: number, session: number, mission: number) {
  return api<void>(`/misiones/${game}/${session}/${mission}`, 'DELETE');
}

export const obtenerMisiones = getMissions;
export const crearMision = createMission;
export const completarMision = completeMission;
export const actualizarMision = updateMission;
export const eliminarMision = deleteMission;
