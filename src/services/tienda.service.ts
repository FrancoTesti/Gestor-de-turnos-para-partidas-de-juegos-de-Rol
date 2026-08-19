import { EntityManager } from '@mikro-orm/core';
import { Clase } from '../entities/Clase.entity';
import { Tienda } from '../entities/Tienda.entity';
import type { ActualizarTiendaDTO, CrearTiendaDTO, TiendaPublicaDTO } from '../types/tienda.dto';

export class TiendaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(): Promise<TiendaPublicaDTO[]> {
    const tiendas = await this.em.find(Tienda, {}, { populate: ['clase'] });
    return tiendas.map((t) => this.aTiendaPublica(t));
  }

  async obtenerPorId(id: number): Promise<TiendaPublicaDTO | null> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id }, { populate: ['clase'] });
    return tienda ? this.aTiendaPublica(tienda) : null;
  }

  async crearTienda(data: CrearTiendaDTO): Promise<TiendaPublicaDTO> {
    let clase: Clase | null = null;
    if (data.idClase) {
      clase = await this.em.findOne(Clase, { idClase: data.idClase });
    }

    const tienda = this.em.create(Tienda, {
      nombre: data.nombre,
      claseTienda: data.claseTienda,
      clase,
    });

    await this.em.flush();
    return this.aTiendaPublica(tienda);
  }

  async actualizarTienda(id: number, data: ActualizarTiendaDTO): Promise<TiendaPublicaDTO | null> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id });
    if (!tienda) return null;

    if (data.idClase !== undefined) {
      tienda.clase = data.idClase ? await this.em.findOne(Clase, { idClase: data.idClase }) : null;
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
    return {
      idTienda: t.idTienda,
      nombre: t.nombre,
      claseTienda: t.claseTienda,
      idClase: t.clase ? t.clase.idClase : null,
    };
  }
}
