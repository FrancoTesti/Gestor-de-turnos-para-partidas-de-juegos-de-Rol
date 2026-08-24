import type { Jugador } from '../interfaces.ts';

export interface JugadorExtendido extends Jugador {
  nickname?: string;
  nombreUsuario?: string;
}

const JUGADORES_URL = '/api/jugadores';

export async function obtenerJugadores(): Promise<JugadorExtendido[]> {
  try {
    const respuesta = await fetch(JUGADORES_URL);
    if (!respuesta.ok) return [];
    return (await respuesta.json()) as JugadorExtendido[];
  } catch {
    return [];
  }
}
