import { api } from './api';
import type { Mision } from '../interfaces';

export type Recompensa = { idPersonaje: number, dinero: number, xp: number };

export function obtenerMisiones() {
  return api<Mision[]>('/misiones');
}

export function crearMision(data: Partial<Mision>) {
  return api<Mision>('/misiones', 'POST', data);
}

export function completarMision(game: number, session: number, mission: number, recompensas: Recompensa[]) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}/completar`, 'POST', { recompensas });
}
export function actualizarMision(game: number, session: number, mission: number, data: Partial<Mision>) {
  return api<Mision>(`/misiones/${game}/${session}/${mission}`, 'PUT', data);
}

export function eliminarMision(game: number, session: number, mission: number) {
  return api<void>(`/misiones/${game}/${session}/${mission}`, 'DELETE');
}
