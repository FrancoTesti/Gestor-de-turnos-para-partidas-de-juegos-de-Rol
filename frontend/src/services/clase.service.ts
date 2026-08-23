import type { Clase } from '../interfaces.ts';

const CLASES_URL = '/api/clases';

export type CrearClaseData = Omit<Clase, 'idClase'>;
export type ActualizarClaseData = Partial<CrearClaseData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

export async function obtenerClases(): Promise<Clase[]> {
  const respuesta = await fetch(CLASES_URL);
  return procesarRespuesta<Clase[]>(respuesta);
}

export async function crearClase(data: CrearClaseData): Promise<Clase> {
  const respuesta = await fetch(CLASES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Clase>(respuesta);
}

export async function actualizarClase(idClase: number, data: ActualizarClaseData): Promise<Clase> {
  const respuesta = await fetch(`${CLASES_URL}/${idClase}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Clase>(respuesta);
}

export async function eliminarClase(idClase: number): Promise<void> {
  const respuesta = await fetch(`${CLASES_URL}/${idClase}`, {
    method: 'DELETE',
  });
  if (!respuesta.ok) {
    await procesarRespuesta<never>(respuesta);
  }
}
