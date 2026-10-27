import type { Clase } from '../interfaces.ts';
import { api } from './api';

const CLASES_URL = '/clases';

export type CreateClassData = Omit<Clase, 'idClase'>;
export type UpdateClassData = Partial<CreateClassData>;

export async function getClasses(): Promise<Clase[]> {
  return api<Clase[]>(CLASES_URL);
}

export async function createClass(data: CreateClassData): Promise<Clase> {
  return api<Clase>(CLASES_URL, 'POST', data);
}

export async function updateClass(idClase: number, data: UpdateClassData): Promise<Clase> {
  return api<Clase>(`${CLASES_URL}/${idClase}`, 'PUT', data);
}

export async function deleteClass(idClase: number): Promise<void> {
  await api<void>(`${CLASES_URL}/${idClase}`, 'DELETE');
}
