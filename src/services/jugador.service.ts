import { EntityManager } from '@mikro-orm/core';
import { Jugador } from '../entities/Jugador.entity';

export interface JugadorDTO {
  idUsuario: number;
  nickname: string;
  nombreUsuario: string;
  estado: boolean;
}

export class JugadorService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(): Promise<JugadorDTO[]> {
    const jugadores = await this.em.find(Jugador, {}, { populate: ['usuario'] });
    return jugadores.map((j) => ({
      idUsuario: j.usuario ? j.usuario.idUsuario : 0,
      nickname: j.usuario ? j.usuario.nickname : '',
      nombreUsuario: j.usuario ? j.usuario.nombreUsuario : '',
      estado: j.estado,
    }));
  }
}
