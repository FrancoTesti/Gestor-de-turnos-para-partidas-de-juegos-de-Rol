import type { Jugador } from '../interfaces';
import { api } from './api';

export interface JugadorExtendido extends Jugador {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}
export type CrearJugadorData = { idUsuario: number; estado: boolean };

export const obtenerJugadores = () => api<JugadorExtendido[]>('/jugadores');
export const obtenerJugadorPorId = (id: number) => api<JugadorExtendido>(`/jugadores/${id}`);
export const crearJugador = (data: CrearJugadorData) => api<JugadorExtendido>('/jugadores', 'POST', data);
export const actualizarJugador = (id: number, data: Partial<CrearJugadorData>) => api<JugadorExtendido>(`/jugadores/${id}`, 'PUT', data);
export const eliminarJugador = (id: number) => api<void>(`/jugadores/${id}`, 'DELETE');
