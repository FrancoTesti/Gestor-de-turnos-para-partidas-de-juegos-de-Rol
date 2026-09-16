import type { Usuario } from '../interfaces';
import { api } from './api';

export type CrearUsuarioData = Omit<Usuario, 'idUsuario'> & { contrasena: string };
export type ActualizarUsuarioData = Partial<CrearUsuarioData>;

export const obtenerUsuarios = () => api<Usuario[]>('/usuarios');
export const obtenerUsuarioPorId = (id: number) => api<Usuario>(`/usuarios/${id}`);
export const crearUsuario = (data: CrearUsuarioData) => api<Usuario>('/usuarios', 'POST', data);
export const actualizarUsuario = (id: number, data: ActualizarUsuarioData) => api<Usuario>(`/usuarios/${id}`, 'PUT', data);
export const eliminarUsuario = (id: number) => api<void>(`/usuarios/${id}`, 'DELETE');
