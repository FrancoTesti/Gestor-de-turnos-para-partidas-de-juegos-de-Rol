import type { Usuario } from '../interfaces';
import { api } from './api';

export type CrearUsuarioData = Omit<Usuario, 'idUsuario'> & { contrasena: string };
export type ActualizarUsuarioData = Partial<CrearUsuarioData>;

export const getUsers = () => api<Usuario[]>('/usuarios');
export const getUserById = (id: number) => api<Usuario>(`/usuarios/${id}`);
export const createUser = (data: CrearUsuarioData) => api<Usuario>('/usuarios', 'POST', data);
export const updateUser = (id: number, data: ActualizarUsuarioData) => api<Usuario>(`/usuarios/${id}`, 'PUT', data);
export const deleteUser = (id: number) => api<void>(`/usuarios/${id}`, 'DELETE');

export const obtenerUsuarios = getUsers;
export const obtenerUsuarioPorId = getUserById;
export const crearUsuario = createUser;
export const actualizarUsuario = updateUser;
export const eliminarUsuario = deleteUser;
