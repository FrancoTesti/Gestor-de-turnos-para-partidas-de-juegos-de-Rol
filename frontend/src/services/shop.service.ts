import type { Tienda } from '../interfaces.ts';
import { api } from './api';

const TIENDAS_URL = '/tiendas';

export type CreateShopData = Omit<Tienda, 'idTienda'>;
export type CrearTiendaData = CreateShopData;

export type UpdateShopData = Partial<CreateShopData>;
export type ActualizarTiendaData = UpdateShopData;

export async function getShops(params?: { idPartida?: number }): Promise<Tienda[]> {
  const query = params?.idPartida ? `?idPartida=${params.idPartida}` : '';
  return api<Tienda[]>(`${TIENDAS_URL}${query}`);
}
export const obtenerTiendas = getShops;

export async function getShopById(idTienda: number): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`);
}
export const obtenerTiendaPorId = getShopById;

export async function createShop(data: CreateShopData): Promise<Tienda> {
  return api<Tienda>(TIENDAS_URL, 'POST', data);
}
export const crearTienda = createShop;

export async function updateShop(idTienda: number, data: UpdateShopData): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`, 'PUT', data);
}
export const actualizarTienda = updateShop;

export async function deleteShop(idTienda: number): Promise<void> {
  await api<void>(`${TIENDAS_URL}/${idTienda}`, 'DELETE');
}
export const eliminarTienda = deleteShop;
