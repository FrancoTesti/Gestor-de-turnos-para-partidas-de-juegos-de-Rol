import type { Clase } from '../interfaces.ts';
import { api } from './api';

const CLASES_URL = '/clases';

export type CreateClassData = Omit<Clase, 'idClase'>;
export type CrearClaseData = CreateClassData;

export type UpdateClassData = Partial<CreateClassData>;
export type ActualizarClaseData = UpdateClassData;

export async function getClasses(): Promise<Clase[]> {
  return api<Clase[]>(CLASES_URL);
}
export const obtenerClases = getClasses;

export async function getClassById(idClase: number): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`);
}
export const obtenerClasePorId = getClassById;

export async function createClass(data: CreateClassData): Promise<Clase> {
  return api<Clase>(CLASES_URL, 'POST', data);
}
export const crearClase = createClass;

export async function updateClass(idClase: number, data: UpdateClassData): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`, 'PUT', data);
}
export const actualizarClase = updateClass;

export async function deleteClass(idClase: number): Promise<void> {
  await api<void>(`${CLASES_URL}/${idClase}`, 'DELETE');
}
export const eliminarClase = deleteClass;
