import type { Partida } from '../interfaces.ts';

const PARTIDAS_URL = '/api/partidas';

export async function obtenerPartidas(): Promise<Partida[]> {
  try {
    const respuesta = await fetch(PARTIDAS_URL);
    if (!respuesta.ok) return [];
    return (await respuesta.json()) as Partida[];
  } catch {
    return [];
  }
}
