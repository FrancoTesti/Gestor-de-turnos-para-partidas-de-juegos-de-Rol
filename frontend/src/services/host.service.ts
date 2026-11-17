import type { Anfitrion } from '../interfaces';
import { api } from './api';

export interface ExtendedHost extends Anfitrion {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}

export type CreateHostData = { idUsuario: number };

export const createHost = (data: CreateHostData) => api<ExtendedHost>('/anfitriones', 'POST', data);

export const deleteHost = (id: number) => api<void>(`/anfitriones/${id}`, 'DELETE');
