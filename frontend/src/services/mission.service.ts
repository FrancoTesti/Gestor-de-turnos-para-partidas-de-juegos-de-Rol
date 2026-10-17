import { api } from './api';
import type { Mision } from '../interfaces';

export type Reward = { idPersonaje: number, dinero: number, xp: number };
export type Recompensa = Reward;

export function getMissions() {
  return api<Mision[]>('/misiones');
}
export const obtenerMisiones = getMissions;

export function createMission(data: Partial<Mision>) {
  return api<Mision>('/misiones', 'POST', data);
}
export const crearMision = createMission;

export function completeMission(game: number, session: number, mission: number, recompensas: Reward[]) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}/completar`, 'POST', { recompensas });
}
export const completarMision = completeMission;

export function updateMission(game: number, session: number, mission: number, data: Partial<Mision>) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}`, 'PUT', data);
}
export const actualizarMision = updateMission;

export function deleteMission(game: number, session: number, mission: number) {
  return api<void>(`/misiones/${game}/${session}/${mission}`, 'DELETE');
}
export const eliminarMision = deleteMission;
