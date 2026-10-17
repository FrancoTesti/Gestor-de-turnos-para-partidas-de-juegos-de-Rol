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

export const getHosts = () => api<AnfitrionExtendido[]>('/anfitriones');
export const getHostById = (id: number) => api<AnfitrionExtendido>(`/anfitriones/${id}`);
export const createHost = (data: CrearAnfitrionData) => api<AnfitrionExtendido>('/anfitriones', 'POST', data);
export const deleteHost = (id: number) => api<void>(`/anfitriones/${id}`, 'DELETE');

export const obtenerAnfitriones = getHosts;
export const obtenerAnfitrionPorId = getHostById;
export const crearAnfitrion = createHost;
export const eliminarAnfitrion = deleteHost;
