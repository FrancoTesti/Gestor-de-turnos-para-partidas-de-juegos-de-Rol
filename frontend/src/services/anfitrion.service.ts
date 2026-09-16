import type { Anfitrion } from '../interfaces';
import { api } from './api';

// El backend devuelve el anfitrión junto con los datos de su Usuario para poder
// mostrar nombre y nickname sin pedir /usuarios otra vez.
export interface AnfitrionExtendido extends Anfitrion {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}
// El karma y la cantidad de partidas activas los calcula el servidor: solo se envía el dueño.
export type CrearAnfitrionData = { idUsuario: number };

export const obtenerAnfitriones = () => api<AnfitrionExtendido[]>('/anfitriones');
export const obtenerAnfitrionPorId = (id: number) => api<AnfitrionExtendido>(`/anfitriones/${id}`);
export const crearAnfitrion = (data: CrearAnfitrionData) => api<AnfitrionExtendido>('/anfitriones', 'POST', data);
export const eliminarAnfitrion = (id: number) => api<void>(`/anfitriones/${id}`, 'DELETE');
