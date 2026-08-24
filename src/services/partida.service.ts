import { EntityManager } from '@mikro-orm/core';
import { Partida } from '../entities/Partida.entity';

export interface PartidaDTO {
  idPartida: number;
  nombre: string;
  estado: boolean;
  limiteJugadores: number;
}

export class PartidaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(): Promise<PartidaDTO[]> {
    const partidas = await this.em.find(Partida, {});
    return partidas.map((p) => ({
      idPartida: p.idPartida,
      nombre: p.nombre,
      estado: p.estado,
      limiteJugadores: p.limiteJugadores,
    }));
  }
}
