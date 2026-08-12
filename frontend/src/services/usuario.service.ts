import type { Usuario } from '../interfaces.ts';

const USUARIOS_URL = '/api/usuarios';

export type CrearUsuarioData = Omit<Usuario, 'idUsuario'>;
export type ActualizarUsuarioData = Partial<CrearUsuarioData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}

export async function obtenerUsuarios(): Promise<Usuario[]> {
  const respuesta = await fetch(USUARIOS_URL);
  return procesarRespuesta<Usuario[]>(respuesta);
}

export async function obtenerUsuarioPorId(idUsuario: number): Promise<Usuario> {
  const respuesta = await fetch(`${USUARIOS_URL}/${idUsuario}`);
  return procesarRespuesta<Usuario>(respuesta);
}

export async function crearUsuario(data: CrearUsuarioData): Promise<Usuario> {
  const respuesta = await fetch(USUARIOS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return procesarRespuesta<Usuario>(respuesta);
}

export async function actualizarUsuario(
  idUsuario: number,
  data: ActualizarUsuarioData,
): Promise<Usuario> {
  const respuesta = await fetch(`${USUARIOS_URL}/${idUsuario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return procesarRespuesta<Usuario>(respuesta);
}

export async function eliminarUsuario(idUsuario: number): Promise<void> {
  const respuesta = await fetch(`${USUARIOS_URL}/${idUsuario}`, {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    await procesarRespuesta<never>(respuesta);
  }
}
