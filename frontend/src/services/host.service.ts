import type { Anfitrion } from '../interfaces';
import { api } from './api';

// El backend devuelve el anfitrión junto con los datos de su Usuario para poder
// mostrar nombre y nickname sin pedir /usuarios otra vez.
export interface ExtendedHost extends Anfitrion {
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}
export type AnfitrionExtendido = ExtendedHost;

// El karma y la cantidad de partidas activas los calcula el servidor: solo se envía el dueño.
export type CreateHostData = { idUsuario: number };
export type CrearAnfitrionData = CreateHostData;

export const getHosts = () => api<ExtendedHost[]>('/anfitriones');
export const obtenerAnfitriones = getHosts;

export const getHostById = (id: number) => api<ExtendedHost>(`/anfitriones/${id}`);
export const obtenerAnfitrionPorId = getHostById;

export const createHost = (data: CreateHostData) => api<ExtendedHost>('/anfitriones', 'POST', data);
export const crearAnfitrion = createHost;

export const deleteHost = (id: number) => api<void>(`/anfitriones/${id}`, 'DELETE');
export const eliminarAnfitrion = deleteHost;
