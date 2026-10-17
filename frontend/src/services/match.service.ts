import { api } from './api';

export type MatchStatus = 'activa' | 'finalizada';
export type EstadoPartida = MatchStatus;
export type MatchState = MatchStatus;

export interface PublicMatch {
  idPartida: number;
  nombre: string;
  estado: MatchStatus;
  limiteJugadores: number;
  esPrivada: boolean;
  idUsuarioAnfitrion: number;
  nicknameAnfitrion: string;
}
export type PartidaPublica = PublicMatch;
export type MatchPublic = PublicMatch;

export interface CreateMatchData {
  nombre: string;
  estado: MatchStatus;
  limiteJugadores: number;
  esPrivada: boolean;
  contrasena?: string;
  idUsuarioAnfitrion: number;
}
export type CrearPartidaData = CreateMatchData;

export type UpdateMatchData = Partial<CreateMatchData>;
export type ActualizarPartidaData = UpdateMatchData;

export const getMatches = () => api<PublicMatch[]>('/partidas');
export const obtenerPartidas = getMatches;

export const getActiveMatches = () => api<PublicMatch[]>('/partidas/activas');
export const obtenerPartidasActivas = getActiveMatches;

export const getMatchById = (id: number) => api<PublicMatch>(`/partidas/${id}`);
export const obtenerPartidaPorId = getMatchById;

export const createMatch = (data: CreateMatchData) => api<PublicMatch>('/partidas', 'POST', data);
export const crearPartida = createMatch;

export const updateMatch = (id: number, data: UpdateMatchData) => api<PublicMatch>(`/partidas/${id}`, 'PUT', data);
export const actualizarPartida = updateMatch;

export const deleteMatch = (id: number) => api<void>(`/partidas/${id}`, 'DELETE');
export const eliminarPartida = deleteMatch;
