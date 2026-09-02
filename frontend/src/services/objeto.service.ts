const OBJETOS_URL = '/api/objetos';

export interface ObjetoPublico {
  idObjeto: number;
  valor: number;
  descripcion: string;
  nombre: string;
  nivelObjeto: number;
  tipoObjeto: string;
  idTienda: number | null;
  idPersonaje: number | null;
  numInventario: number | null;
  posicion: number;
}

export type CrearObjetoData = Omit<ObjetoPublico, 'idObjeto' | 'idPersonaje' | 'numInventario'>;
export type ActualizarObjetoData = Partial<CrearObjetoData>;

export interface ComprarObjetoData {
  idPersonaje: number;
  numInventario: number;
  posicion: number;
}

export interface ResultadoCompraObjeto {
  objeto: ObjetoPublico;
  idPersonaje: number;
  numInventario: number;
  dineroRestante: number;
}

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

export async function comprarObjeto(
  idObjeto: number,
  data: ComprarObjetoData,
): Promise<ResultadoCompraObjeto> {
  const respuesta = await fetch(`${OBJETOS_URL}/${idObjeto}/comprar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<ResultadoCompraObjeto>(respuesta);
}
