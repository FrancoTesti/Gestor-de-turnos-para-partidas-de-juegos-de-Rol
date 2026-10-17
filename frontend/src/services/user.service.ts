import type { Usuario } from '../interfaces';
import { api } from './api';

export type CreateUserData = Omit<Usuario, 'idUsuario'> & { contrasena: string };
export type CrearUsuarioData = CreateUserData;

export type UpdateUserData = Partial<CreateUserData>;
export type ActualizarUsuarioData = UpdateUserData;

export const getUsers = () => api<Usuario[]>('/usuarios');
export const obtenerUsuarios = getUsers;

export const getUserById = (id: number) => api<Usuario>(`/usuarios/${id}`);
export const obtenerUsuarioPorId = getUserById;

export const createUser = (data: CreateUserData) => api<Usuario>('/usuarios', 'POST', data);
export const crearUsuario = createUser;

export const updateUser = (id: number, data: UpdateUserData) => api<Usuario>(`/usuarios/${id}`, 'PUT', data);
export const actualizarUsuario = updateUser;

export const deleteUser = (id: number) => api<void>(`/usuarios/${id}`, 'DELETE');
export const eliminarUsuario = deleteUser;
