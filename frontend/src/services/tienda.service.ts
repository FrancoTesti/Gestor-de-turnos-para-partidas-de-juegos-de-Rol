import type { Tienda } from '../interfaces.ts';
import { api } from './api';

const TIENDAS_URL = '/tiendas';

export type CrearTiendaData = Omit<Tienda, 'idTienda'>;
export type ActualizarTiendaData = Partial<CrearTiendaData>;

export async function obtenerTiendas(): Promise<Tienda[]> {
  return api<Tienda[]>(TIENDAS_URL);
}

export async function obtenerTiendaPorId(idTienda: number): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`);
}

export async function crearTienda(data: CrearTiendaData): Promise<Tienda> {
  return api<Tienda>(TIENDAS_URL, 'POST', data);
}

export async function actualizarTienda(idTienda: number, data: ActualizarTiendaData): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`, 'PUT', data);
}

export async function eliminarTienda(idTienda: number): Promise<void> {
  await api<void>(`${TIENDAS_URL}/${idTienda}`, 'DELETE');
}
