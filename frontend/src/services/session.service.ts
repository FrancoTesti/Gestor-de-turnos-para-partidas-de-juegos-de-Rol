import { api } from './api';
import type { Sesion } from '../interfaces';

export interface SessionParticipant {
  idPersonaje: number;
  nombre: string;
  dioKarma: boolean;
}
export type ParticipanteSesion = SessionParticipant;

export interface SessionDetailDTO extends Sesion {
  participantes?: SessionParticipant[];
}
export type SesionDetalleDTO = SessionDetailDTO;

export function getSessions() {
  return api<Sesion[]>('/sesiones');
}
export const obtenerSesiones = getSessions;

export function getSession(game: number, number: number) {
  return api<SessionDetailDTO>(`/sesiones/${game}/${number}`);
}
export const obtenerSesion = getSession;

export function createSession(data: Partial<Sesion>) {
  return api<Sesion>('/sesiones', 'POST', data);
}
export const crearSesion = createSession;

export function playSession(game: number, number: number, idPersonajes: number[]) {
  return api<Sesion>(`/sesiones/${game}/${number}/jugar`, 'POST', { idPersonajes });
}
export const jugarSesion = playSession;

export function finishSession(game: number, number: number) {
  return api<Sesion>(`/sesiones/${game}/${number}/finalizar`, 'POST');
}
export const finalizarSesion = finishSession;

export function rateHost(game: number, number: number, valor: number) {
  return api<{ karma: number }>(`/sesiones/${game}/${number}/calificar`, 'POST', { valor });
}
export const calificarAnfitrion = rateHost;
