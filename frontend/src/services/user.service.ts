import type { Usuario } from '../interfaces';
import { api } from './api';

export type CreateUserData = Omit<Usuario, 'idUsuario'> & { contrasena: string };
export type UpdateUserData = Partial<CreateUserData>;

export const updateUser = (id: number, data: UpdateUserData) => api<Usuario>(`/usuarios/${id}`, 'PUT', data);
