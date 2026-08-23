import type { Objeto } from '../interfaces.ts';

const OBJETOS_URL = '/api/objetos';

export type CrearObjetoData = Omit<Objeto, 'idObjeto' | 'idPersonaje' | 'numInventario'>;
export type ActualizarObjetoData = Partial<CrearObjetoData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

export async function obtenerObjetos(): Promise<Objeto[]> {
  const respuesta = await fetch(OBJETOS_URL);
  return procesarRespuesta<Objeto[]>(respuesta);
}

export async function crearObjeto(data: CrearObjetoData): Promise<Objeto> {
  const respuesta = await fetch(OBJETOS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Objeto>(respuesta);
}

export async function actualizarObjeto(idObjeto: number, data: ActualizarObjetoData): Promise<Objeto> {
  const respuesta = await fetch(`${OBJETOS_URL}/${idObjeto}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Objeto>(respuesta);
}

export async function eliminarObjeto(idObjeto: number): Promise<void> {
  const respuesta = await fetch(`${OBJETOS_URL}/${idObjeto}`, {
    method: 'DELETE',
  });
  if (!respuesta.ok) {
    await procesarRespuesta<never>(respuesta);
  }
}
