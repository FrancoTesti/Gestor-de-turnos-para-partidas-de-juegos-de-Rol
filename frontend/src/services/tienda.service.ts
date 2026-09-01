import type { Tienda } from '../interfaces.ts';

const TIENDAS_URL = '/api/tiendas';

export type CrearTiendaData = Omit<Tienda, 'idTienda'>;
export type ActualizarTiendaData = Partial<CrearTiendaData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

export async function obtenerTiendas(): Promise<Tienda[]> {
  const respuesta = await fetch(TIENDAS_URL);
  return procesarRespuesta<Tienda[]>(respuesta);
}

export async function crearTienda(data: CrearTiendaData): Promise<Tienda> {
  const respuesta = await fetch(TIENDAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Tienda>(respuesta);
}

export async function actualizarTienda(idTienda: number, data: ActualizarTiendaData): Promise<Tienda> {
  const respuesta = await fetch(`${TIENDAS_URL}/${idTienda}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Tienda>(respuesta);
}

export async function eliminarTienda(idTienda: number): Promise<void> {
  const respuesta = await fetch(`${TIENDAS_URL}/${idTienda}`, {
    method: 'DELETE',
  });
  if (!respuesta.ok) {
    await procesarRespuesta<never>(respuesta);
  }
}
