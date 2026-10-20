import { api } from './api';
import type { Mision } from '../interfaces';

export type Reward = { idPersonaje: number, dinero: number, xp: number };

export function getMissions() {
  return api<Mision[]>('/misiones');
}

export function createMission(data: Partial<Mision>) {
  return api<Mision>('/misiones', 'POST', data);
}

export function completeMission(game: number, session: number, mission: number, recompensas: Reward[]) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}/completar`, 'POST', { recompensas });
}

export function updateMission(game: number, session: number, mission: number, data: Partial<Mision>) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}`, 'PUT', data);
}

export function deleteMission(game: number, session: number, mission: number) {
  return api<void>(`/misiones/${game}/${session}/${mission}`, 'DELETE');
}
