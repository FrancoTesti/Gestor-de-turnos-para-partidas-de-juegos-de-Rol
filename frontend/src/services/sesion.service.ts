import { api } from './api';
import type { Sesion } from '../interfaces';

export interface ParticipanteSesion {
  idPersonaje: number;
  nombre: string;
  dioKarma: boolean;
}

export interface SesionDetalleDTO extends Sesion {
  participantes?: ParticipanteSesion[];
}

export function getSessions() {
  return api<Sesion[]>('/sesiones');
}

export function getSession(game: number, number: number) {
  return api<SesionDetalleDTO>(`/sesiones/${game}/${number}`);
}

export function createSession(data: Partial<Sesion>) {
  return api<Sesion>('/sesiones', 'POST', data);
}

export function playSession(game: number, number: number, idPersonajes: number[]) {
  return api<Sesion>(`/sesiones/${game}/${number}/jugar`, 'POST', { idPersonajes });
}

export function finishSession(game: number, number: number) {
  return api<Sesion>(`/sesiones/${game}/${number}/finalizar`, 'POST');
}

export function rateHost(game: number, number: number, valor: number) {
  return api<{ karma: number }>(`/sesiones/${game}/${number}/calificar`, 'POST', { valor });
}

export const obtenerSesiones = getSessions;
export const obtenerSesion = getSession;
export const crearSesion = createSession;
export const jugarSesion = playSession;
export const finalizarSesion = finishSession;
export const calificarAnfitrion = rateHost;
