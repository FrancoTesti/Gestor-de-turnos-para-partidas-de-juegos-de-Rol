import { api } from './api';

export type EstadoPartida = 'activa' | 'finalizada';

export interface PartidaPublica {
  idPartida: number;
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;
  esPrivada: boolean;
  idUsuarioAnfitrion: number;
  nicknameAnfitrion: string;
}

export interface CrearPartidaData {
  nombre: string;
  estado: EstadoPartida;
  limiteJugadores: number;
  esPrivada: boolean;
  contrasena?: string;
  idUsuarioAnfitrion: number;
}

export type ActualizarPartidaData = Partial<CrearPartidaData>;

export const obtenerPartidas = () => api<PartidaPublica[]>('/partidas');
export const obtenerPartidasActivas = () => api<PartidaPublica[]>('/partidas/activas');
export const obtenerPartidaPorId = (id: number) => api<PartidaPublica>(`/partidas/${id}`);
export const crearPartida = (data: CrearPartidaData) => api<PartidaPublica>('/partidas', 'POST', data);
export const actualizarPartida = (id: number, data: ActualizarPartidaData) => api<PartidaPublica>(`/partidas/${id}`, 'PUT', data);
export const eliminarPartida = (id: number) => api<void>(`/partidas/${id}`, 'DELETE');
