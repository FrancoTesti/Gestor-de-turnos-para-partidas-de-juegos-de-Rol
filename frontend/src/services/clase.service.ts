import type { Clase } from '../interfaces.ts';
import { api } from './api';

const CLASES_URL = '/clases';

export type CrearClaseData = Omit<Clase, 'idClase'>;
export type ActualizarClaseData = Partial<CrearClaseData>;

export async function obtenerClases(): Promise<Clase[]> {
  return api<Clase[]>(CLASES_URL);
}

export async function obtenerClasePorId(idClase: number): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`);
}

export async function crearClase(data: CrearClaseData): Promise<Clase> {
  return api<Clase>(CLASES_URL, 'POST', data);
}

export async function actualizarClase(idClase: number, data: ActualizarClaseData): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`, 'PUT', data);
}

export async function eliminarClase(idClase: number): Promise<void> {
  await api<void>(`${CLASES_URL}/${idClase}`, 'DELETE');
}
