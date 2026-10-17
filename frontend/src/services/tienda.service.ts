import type { Tienda } from '../interfaces.ts';
import { api } from './api';

const TIENDAS_URL = '/tiendas';

export type CrearTiendaData = Omit<Tienda, 'idTienda'>;
export type ActualizarTiendaData = Partial<CrearTiendaData>;

export async function getStores(): Promise<Tienda[]> {
  return api<Tienda[]>(TIENDAS_URL);
}

export async function getStoreById(idTienda: number): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`);
}

export async function createStore(data: CrearTiendaData): Promise<Tienda> {
  return api<Tienda>(TIENDAS_URL, 'POST', data);
}

export async function updateStore(idTienda: number, data: ActualizarTiendaData): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`, 'PUT', data);
}

export async function deleteStore(idTienda: number): Promise<void> {
  await api<void>(`${TIENDAS_URL}/${idTienda}`, 'DELETE');
}

export const obtenerTiendas = getStores;
export const obtenerTiendaPorId = getStoreById;
export const crearTienda = createStore;
export const actualizarTienda = updateStore;
export const eliminarTienda = deleteStore;
