const OBJETOS_URL = '/api/objetos';

export interface ObjetoPublico {
  idObjeto: number;
  valor: number;
  descripcion: string;
  nombre: string;
  nivelObjeto: number;
  tipoObjeto: string;
  idTienda: number | null;
  posicion: number;
}

export type CrearObjetoData = Omit<ObjetoPublico, 'idObjeto'>;
export type ActualizarObjetoData = Partial<CrearObjetoData>;

async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

export async function obtenerObjetos(): Promise<ObjetoPublico[]> {
  const respuesta = await fetch(OBJETOS_URL);
  return procesarRespuesta<ObjetoPublico[]>(respuesta);
}

export async function obtenerObjetoPorId(idObjeto: number): Promise<ObjetoPublico> {
  const respuesta = await fetch(`${OBJETOS_URL}/${idObjeto}`);
  return procesarRespuesta<ObjetoPublico>(respuesta);
}

export async function crearObjeto(data: CrearObjetoData): Promise<ObjetoPublico> {
  const respuesta = await fetch(OBJETOS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<ObjetoPublico>(respuesta);
}

export async function actualizarObjeto(idObjeto: number, data: ActualizarObjetoData): Promise<ObjetoPublico> {
  const respuesta = await fetch(`${OBJETOS_URL}/${idObjeto}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<ObjetoPublico>(respuesta);
}

export async function eliminarObjeto(idObjeto: number): Promise<void> {
  const respuesta = await fetch(`${OBJETOS_URL}/${idObjeto}`, {
    method: 'DELETE',
  });
  if (!respuesta.ok) {
    await procesarRespuesta<never>(respuesta);
  }
}
