import type { Tienda } from '../interfaces.ts';
import { api } from './api';

const TIENDAS_URL = '/tiendas';

export type CreateShopData = Omit<Tienda, 'idTienda'>;
export type UpdateShopData = Partial<CreateShopData>;

export async function getShops(params?: { idPartida?: number }): Promise<Tienda[]> {
  const query = params?.idPartida ? `?idPartida=${params.idPartida}` : '';
  return api<Tienda[]>(`${TIENDAS_URL}${query}`);
}

export async function createShop(data: CreateShopData): Promise<Tienda> {
  return api<Tienda>(TIENDAS_URL, 'POST', data);
}

export async function updateShop(idTienda: number, data: UpdateShopData): Promise<Tienda> {
  return api<Tienda>(`${TIENDAS_URL}/${idTienda}`, 'PUT', data);
}

export async function deleteShop(idTienda: number): Promise<void> {
  await api<void>(`${TIENDAS_URL}/${idTienda}`, 'DELETE');
}
