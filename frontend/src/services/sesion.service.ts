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

export function obtenerSesiones() {
  return api<Sesion[]>('/sesiones');
}

export function obtenerSesion(game: number, number: number) {
  return api<SesionDetalleDTO>(`/sesiones/${game}/${number}`);
}

export function crearSesion(data: Partial<Sesion>) {
  return api<Sesion>('/sesiones', 'POST', data);
}

export function jugarSesion(game: number, number: number, idPersonajes: number[]) {
  return api<Sesion>(`/sesiones/${game}/${number}/jugar`, 'POST', { idPersonajes });
}

export function finalizarSesion(game: number, number: number) {
  return api<Sesion>(`/sesiones/${game}/${number}/finalizar`, 'POST');
}

export function calificarAnfitrion(game: number, number: number, karma: number) {
  return api<void>(`/sesiones/${game}/${number}/calificar`, 'POST', { karma });
}