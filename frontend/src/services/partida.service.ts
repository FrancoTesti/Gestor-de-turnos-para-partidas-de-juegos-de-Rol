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

export const getGames = () => api<PartidaPublica[]>('/partidas');
export const getActiveGames = () => api<PartidaPublica[]>('/partidas/activas');
export const getGameById = (id: number) => api<PartidaPublica>(`/partidas/${id}`);
export const createGame = (data: CrearPartidaData) => api<PartidaPublica>('/partidas', 'POST', data);
export const updateGame = (id: number, data: ActualizarPartidaData) => api<PartidaPublica>(`/partidas/${id}`, 'PUT', data);
export const deleteGame = (id: number) => api<void>(`/partidas/${id}`, 'DELETE');

export const obtenerPartidas = getGames;
export const obtenerPartidasActivas = getActiveGames;
export const obtenerPartidaPorId = getGameById;
export const crearPartida = createGame;
export const actualizarPartida = updateGame;
export const eliminarPartida = deleteGame;
