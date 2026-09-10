import { api } from './api';

const OBJETOS_URL = '/objetos';

export interface ObjetoPublico {
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

export type CrearObjetoData = Omit<ObjetoPublico, 'idObjeto' | 'idPersonaje' | 'numInventario'>;
export type ActualizarObjetoData = Partial<CrearObjetoData>;

export interface ComprarObjetoData {
  idPersonaje: number;
  numInventario: number;
  posicion: number;
}

export interface ResultadoCompraObjeto {
  objeto: ObjetoPublico;
  idPersonaje: number;
  numInventario: number;
  dineroRestante: number;
}

export interface VenderObjetoData {
  idPersonaje: number;
  idTienda: number;
  precio: number;
}

export interface ResultadoVentaObjeto {
  idObjeto: number;
  idPersonaje: number;
  dineroRestante: number;
  precio: number;
}

export async function obtenerObjetos(): Promise<ObjetoPublico[]> {
  return api<ObjetoPublico[]>(OBJETOS_URL);
}

export async function obtenerObjetoPorId(idObjeto: number): Promise<ObjetoPublico> {
  return api<ObjetoPublico>(`${OBJETOS_URL}/${idObjeto}`);
}

/**
 * Obtiene objetos sugeridos para un personaje según su clase.
 * Usa la ruta autenticada GET /api/objetos/sugeridos/:character
 */
export async function obtenerSugeridos(idPersonaje: number): Promise<ObjetoPublico[]> {
  return api<ObjetoPublico[]>(`${OBJETOS_URL}/sugeridos/${idPersonaje}`);
}

export async function crearObjeto(data: CrearObjetoData): Promise<ObjetoPublico> {
  return api<ObjetoPublico>(OBJETOS_URL, 'POST', data);
}

export async function actualizarObjeto(idObjeto: number, data: ActualizarObjetoData): Promise<ObjetoPublico> {
  return api<ObjetoPublico>(`${OBJETOS_URL}/${idObjeto}`, 'PUT', data);
}

export async function eliminarObjeto(idObjeto: number): Promise<void> {
  await api<void>(`${OBJETOS_URL}/${idObjeto}`, 'DELETE');
}

export async function comprarObjeto(
  idObjeto: number,
  data: ComprarObjetoData,
): Promise<ResultadoCompraObjeto> {
  return api<ResultadoCompraObjeto>(`${OBJETOS_URL}/${idObjeto}/comprar`, 'POST', data);
}

export async function venderObjeto(
  idObjeto: number,
  data: VenderObjetoData,
): Promise<ResultadoVentaObjeto> {
  return api<ResultadoVentaObjeto>(`${OBJETOS_URL}/${idObjeto}/vender`, 'POST', data);
}
