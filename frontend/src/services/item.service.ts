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
export type CrearObjetoData = CreateItemData;

export type UpdateItemData = Partial<CreateItemData>;
export type ActualizarObjetoData = UpdateItemData;

export interface BuyItemData {
  idPersonaje: number;
  numInventario: number;
  posicion?: number;
}
export type ComprarObjetoData = BuyItemData;
export type PurchaseItemData = BuyItemData;

export interface BuyItemResult {
  objeto: PublicItem;
  idPersonaje: number;
  numInventario: number;
  dineroRestante: number;
}
export type ResultadoCompraObjeto = BuyItemResult;

export interface SellItemData {
  idPersonaje: number;
  idTienda: number;
  precio: number;
}
export type VenderObjetoData = SellItemData;

export interface SellItemResult {
  idObjeto: number;
  idPersonaje: number;
  dineroRestante: number;
  precio: number;
}
export type ResultadoVentaObjeto = SellItemResult;

export async function getItems(): Promise<PublicItem[]> {
  const lista = await api<PublicItem[]>(OBJETOS_URL);
  return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' }));
}
export const obtenerObjetos = getItems;

export async function getItemById(idObjeto: number): Promise<PublicItem> {
  return api<PublicItem>(`${OBJETOS_URL}/${idObjeto}`);
}
export const obtenerObjetoPorId = getItemById;

/**
 * Obtiene objetos sugeridos para un personaje según su clase.
 * Usa la ruta autenticada GET /api/objetos/sugeridos/:character
 */
export async function getSuggestedItems(idPersonaje: number): Promise<PublicItem[]> {
  return api<PublicItem[]>(`${OBJETOS_URL}/sugeridos/${idPersonaje}`);
}
export const obtenerSugeridos = getSuggestedItems;

export async function createItem(data: CreateItemData): Promise<PublicItem> {
  return api<PublicItem>(OBJETOS_URL, 'POST', data);
}
export const crearObjeto = createItem;

export async function updateItem(idObjeto: number, data: UpdateItemData): Promise<PublicItem> {
  return api<PublicItem>(`${OBJETOS_URL}/${idObjeto}`, 'PUT', data);
}
export const actualizarObjeto = updateItem;

export async function deleteItem(idObjeto: number): Promise<void> {
  await api<void>(`${OBJETOS_URL}/${idObjeto}`, 'DELETE');
}
export const eliminarObjeto = deleteItem;

export async function buyItem(
  idObjeto: number,
  data: BuyItemData,
): Promise<BuyItemResult> {
  return api<BuyItemResult>(`${OBJETOS_URL}/${idObjeto}/comprar`, 'POST', data);
}
export const comprarObjeto = buyItem;
export const purchaseItem = buyItem;

export async function sellItem(
  idObjeto: number,
  data: SellItemData,
): Promise<SellItemResult> {
  return api<SellItemResult>(`${OBJETOS_URL}/${idObjeto}/vender`, 'POST', data);
}
export const venderObjeto = sellItem;
