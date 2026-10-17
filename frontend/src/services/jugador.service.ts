import type { Jugador } from '../interfaces';
import { api } from './api';

export interface JugadorExtendido extends Jugador {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}
export type CrearJugadorData = { idUsuario: number; estado: boolean };

export const getPlayers = () => api<JugadorExtendido[]>('/jugadores');
export const getPlayerById = (id: number) => api<JugadorExtendido>(`/jugadores/${id}`);
export const createPlayer = (data: CrearJugadorData) => api<JugadorExtendido>('/jugadores', 'POST', data);
export const updatePlayer = (id: number, data: Partial<CrearJugadorData>) => api<JugadorExtendido>(`/jugadores/${id}`, 'PUT', data);
export const deletePlayer = (id: number) => api<void>(`/jugadores/${id}`, 'DELETE');

export const obtenerJugadores = getPlayers;
export const obtenerJugadorPorId = getPlayerById;
export const crearJugador = createPlayer;
export const actualizarJugador = updatePlayer;
export const eliminarJugador = deletePlayer;
