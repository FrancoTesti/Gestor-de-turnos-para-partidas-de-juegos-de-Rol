import type { Jugador } from '../interfaces';
import { api } from './api';

export interface ExtendedPlayer extends Jugador {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}
export type JugadorExtendido = ExtendedPlayer;

export type CreatePlayerData = { idUsuario: number; estado: boolean };
export type CrearJugadorData = CreatePlayerData;

export const getPlayers = () => api<ExtendedPlayer[]>('/jugadores');
export const obtenerJugadores = getPlayers;

export const getPlayerById = (id: number) => api<ExtendedPlayer>(`/jugadores/${id}`);
export const obtenerJugadorPorId = getPlayerById;

export const createPlayer = (data: CreatePlayerData) => api<ExtendedPlayer>('/jugadores', 'POST', data);
export const crearJugador = createPlayer;

export const updatePlayer = (id: number, data: Partial<CreatePlayerData>) => api<ExtendedPlayer>(`/jugadores/${id}`, 'PUT', data);
export const actualizarJugador = updatePlayer;

export const deletePlayer = (id: number) => api<void>(`/jugadores/${id}`, 'DELETE');
export const eliminarJugador = deletePlayer;
