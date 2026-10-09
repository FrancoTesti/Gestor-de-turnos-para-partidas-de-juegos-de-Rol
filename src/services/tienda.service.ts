import { EntityManager } from '@mikro-orm/core';
import { Clase } from '../entities/Clase.entity';
import { Partida } from '../entities/Partida.entity';
import { Tienda } from '../entities/Tienda.entity';
import { ErrorValidacionTienda } from '../validators/tienda.validator';
import type { ActualizarTiendaDTO, CrearTiendaDTO, TiendaPublicaDTO } from '../types/tienda.dto';

export class TiendaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(filtros?: { idPartida?: number }): Promise<TiendaPublicaDTO[]> {
    const where: Record<string, unknown> = {};
    if (filtros?.idPartida) {
      where.partida = { idPartida: filtros.idPartida };
    }
    const tiendas = await this.em.find(Tienda, where, { populate: ['clase', 'partida'] });
    return tiendas.map((t) => this.aTiendaPublica(t));
  }

  async obtenerPorId(id: number): Promise<TiendaPublicaDTO | null> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id }, { populate: ['clase', 'partida'] });
    return tienda ? this.aTiendaPublica(tienda) : null;
  }

  async crearTienda(data: CrearTiendaDTO): Promise<TiendaPublicaDTO> {
    let clase: Clase | null = null;
    if (data.idClase != null) {
      clase = await this.em.findOne(Clase, { idClase: data.idClase });
      if (!clase) throw new ErrorValidacionTienda('La clase indicada no existe');
    }

    let partida: Partida | null = null;
    if (data.idPartida != null) {
      partida = await this.em.findOne(Partida, { idPartida: data.idPartida });
      if (!partida) throw new ErrorValidacionTienda('La partida indicada no existe');
    }

    const tienda = this.em.create(Tienda, {
      nombre: data.nombre,
      claseTienda: data.claseTienda,
      clase,
      ...(partida ? { partida } : {}),
    });

    await this.em.flush();
    return this.aTiendaPublica(tienda);
  }

  async actualizarTienda(id: number, data: ActualizarTiendaDTO): Promise<TiendaPublicaDTO | null> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id });
    if (!tienda) return null;

    if (data.idClase !== undefined) {
      tienda.clase = data.idClase ? await this.em.findOne(Clase, { idClase: data.idClase }) : null;
      if (data.idClase && !tienda.clase) throw new ErrorValidacionTienda('La clase indicada no existe');
    }

    if (data.idPartida !== undefined) {
      tienda.partida = data.idPartida ? await this.em.findOne(Partida, { idPartida: data.idPartida }) : null;
      if (data.idPartida && !tienda.partida) throw new ErrorValidacionTienda('La partida indicada no existe');
    }

    if (data.nombre !== undefined) tienda.nombre = data.nombre;
    if (data.claseTienda !== undefined) tienda.claseTienda = data.claseTienda;

    await this.em.flush();
    return this.aTiendaPublica(tienda);
  }

  async eliminarTienda(id: number): Promise<boolean> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id });
    if (!tienda) return false;

    await this.em.removeAndFlush(tienda);
    return true;
  }

  private aTiendaPublica(t: Tienda): TiendaPublicaDTO {
    const dto: TiendaPublicaDTO = {
      idTienda: t.idTienda,
      nombre: t.nombre,
      claseTienda: t.claseTienda,
      idClase: t.clase ? t.clase.idClase : null,
      ...(t.partida ? { idPartida: t.partida.idPartida, partidaNombre: t.partida.nombre } : {}),
    };
    return dto;
  }
}
