/* funciones que hacen fetch a la API de Jugadores.
 Los componentes React NO llaman a fetch directamente, lo hacen a través de este archivo */
import type { Jugador } from '../interfaces';

const JUGADORES_URL = '/api/jugadores';

// funcion reutilizable: procesa la respuesta del fetch y lanza error si algo salió mal
async function procesarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => null)) as { message?: string } | null;
    throw new Error(cuerpo?.message ?? `Error HTTP ${respuesta.status}`);
  }
  return respuesta.json() as Promise<T>;
}

// tipo para crear un jugador: necesito el idUsuario y el estado
export type CrearJugadorData = {
  idUsuario: number;
  estado: boolean;
};

// GET /api/jugadores — trae todos los jugadores
export async function obtenerJugadores(): Promise<Jugador[]> {
  const respuesta = await fetch(JUGADORES_URL);
  return procesarRespuesta<Jugador[]>(respuesta);
}

// GET /api/jugadores/:id — trae un jugador por su idUsuario
export async function obtenerJugadorPorId(idUsuario: number): Promise<Jugador> {
  const respuesta = await fetch(`${JUGADORES_URL}/${idUsuario}`);
  return procesarRespuesta<Jugador>(respuesta);
}

// POST /api/jugadores — registra a un usuario como jugador
export async function crearJugador(data: CrearJugadorData): Promise<Jugador> {
  const respuesta = await fetch(JUGADORES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Jugador>(respuesta);
}

// PUT /api/jugadores/:id — actualiza el estado de un jugador
export async function actualizarJugador(
  idUsuario: number,
  data: Partial<CrearJugadorData>,
): Promise<Jugador> {
  const respuesta = await fetch(`${JUGADORES_URL}/${idUsuario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return procesarRespuesta<Jugador>(respuesta);
}

// DELETE /api/jugadores/:id — quita el rol de jugador
export function eliminarJugador(idUsuario: number): Promise<void> {
  return fetch(`${JUGADORES_URL}/${idUsuario}`, { method: 'DELETE' })
    .then(respuesta => {
      if (!respuesta.ok) return procesarRespuesta<never>(respuesta);
    })
    .catch(error => {
      console.error('Falló al eliminar jugador:', error);
      throw error;
    });
}