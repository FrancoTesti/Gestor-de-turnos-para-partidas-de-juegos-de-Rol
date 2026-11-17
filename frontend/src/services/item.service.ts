import { api } from './api';

const OBJETOS_URL = '/objetos';

export interface PublicItem {
  idObjeto: number;
  valor: number;
  descripcion: string;
  nombre: string;
  nivelObjeto: number;
  tipoObjeto: string;
  esUnico: boolean;
  idTienda: number | null;
  idPersonaje: number | null;
  numInventario: number | null;
  posicion: number;
}
export type ObjetoPublico = PublicItem;
export type ItemPublic = PublicItem;

export type CreateItemData = Omit<PublicItem, 'idObjeto' | 'idPersonaje' | 'numInventario'>;
export type UpdateItemData = Partial<CreateItemData>;

export interface BuyItemData {
  idPersonaje: number;
  numInventario: number;
  posicion?: number;
}
export type PurchaseItemData = BuyItemData;

export interface BuyItemResult {
  objeto: PublicItem;
  idPersonaje: number;
  numInventario: number;
  dineroRestante: number;
}

export async function getItems(): Promise<PublicItem[]> {
  const lista = await api<PublicItem[]>(OBJETOS_URL);
  return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' }));
}

export async function getItemById(idObjeto: number): Promise<PublicItem> {
  return api<PublicItem>(`${OBJETOS_URL}/${idObjeto}`);
}

export async function createItem(data: CreateItemData): Promise<PublicItem> {
  return api<PublicItem>(OBJETOS_URL, 'POST', data);
}

export async function updateItem(idObjeto: number, data: UpdateItemData): Promise<PublicItem> {
  return api<PublicItem>(`${OBJETOS_URL}/${idObjeto}`, 'PUT', data);
}

export async function deleteItem(idObjeto: number): Promise<void> {
  await api<void>(`${OBJETOS_URL}/${idObjeto}`, 'DELETE');
}

export async function buyItem(
  idObjeto: number,
  data: BuyItemData,
): Promise<BuyItemResult> {
  return api<BuyItemResult>(`${OBJETOS_URL}/${idObjeto}/comprar`, 'POST', data);
}
export const purchaseItem = buyItem;
