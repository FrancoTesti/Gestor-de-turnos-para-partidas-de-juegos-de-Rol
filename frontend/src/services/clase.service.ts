import type { Clase } from '../interfaces.ts';
import { api } from './api';

const CLASES_URL = '/clases';

export type CrearClaseData = Omit<Clase, 'idClase'>;
export type ActualizarClaseData = Partial<CrearClaseData>;

export async function getClasses(): Promise<Clase[]> {
  return api<Clase[]>(CLASES_URL);
}

export async function getClassById(idClase: number): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`);
}

export async function createClass(data: CrearClaseData): Promise<Clase> {
  return api<Clase>(CLASES_URL, 'POST', data);
}

export async function updateClass(idClase: number, data: ActualizarClaseData): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`, 'PUT', data);
}

export async function deleteClass(idClase: number): Promise<void> {
  await api<void>(`${CLASES_URL}/${idClase}`, 'DELETE');
}

export const obtenerClases = getClasses;
export const obtenerClasePorId = getClassById;
export const crearClase = createClass;
export const actualizarClase = updateClass;
export const eliminarClase = deleteClass;
