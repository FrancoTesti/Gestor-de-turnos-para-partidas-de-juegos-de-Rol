import type { Jugador } from '../interfaces';
import { api } from './api';

export interface ExtendedPlayer extends Jugador {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}

export type CreatePlayerData = { idUsuario: number; estado: boolean };

export const createPlayer = (data: CreatePlayerData) => api<ExtendedPlayer>('/jugadores', 'POST', data);

export const updatePlayer = (id: number, data: Partial<CreatePlayerData>) => api<ExtendedPlayer>(`/jugadores/${id}`, 'PUT', data);

export const deletePlayer = (id: number) => api<void>(`/jugadores/${id}`, 'DELETE');
