import { EntityManager } from '@mikro-orm/core';
import { Clase } from '../entities/Clase.entity';
import { Tienda } from '../entities/Tienda.entity';
import { ErrorValidacionTienda } from '../validators/tienda.validator';
import type { ActualizarTiendaDTO, CrearTiendaDTO, TiendaPublicaDTO } from '../types/tienda.dto';

export class TiendaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async getAll(): Promise<TiendaPublicaDTO[]> {
    const tiendas = await this.em.find(Tienda, {}, { populate: ['clase'] });
    return tiendas.map((t) => this.toPublicDTO(t));
  }

  async obtenerTodos(): Promise<TiendaPublicaDTO[]> {
    return this.getAll();
  }

  async getById(id: number): Promise<TiendaPublicaDTO | null> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id }, { populate: ['clase'] });
    return tienda ? this.toPublicDTO(tienda) : null;
  }

  async obtenerPorId(id: number): Promise<TiendaPublicaDTO | null> {
    return this.getById(id);
  }

  async create(data: CrearTiendaDTO): Promise<TiendaPublicaDTO> {
    let clase: Clase | null = null;
    if (data.idClase != null) {
      clase = await this.em.findOne(Clase, { idClase: data.idClase });
      if (!clase) throw new ErrorValidacionTienda('La clase indicada no existe');
    }

    const tienda = this.em.create(Tienda, {
      nombre: data.nombre,
      claseTienda: data.claseTienda,
      clase,
    });

    await this.em.flush();
    return this.toPublicDTO(tienda);
  }

  async crearTienda(data: CrearTiendaDTO): Promise<TiendaPublicaDTO> {
    return this.create(data);
  }

  async update(id: number, data: ActualizarTiendaDTO): Promise<TiendaPublicaDTO | null> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id });
    if (!tienda) return null;

    if (data.idClase !== undefined) {
      tienda.clase = data.idClase ? await this.em.findOne(Clase, { idClase: data.idClase }) : null;
      if (data.idClase && !tienda.clase) throw new ErrorValidacionTienda('La clase indicada no existe');
    }

    if (data.nombre !== undefined) tienda.nombre = data.nombre;
    if (data.claseTienda !== undefined) tienda.claseTienda = data.claseTienda;

    await this.em.flush();
    return this.toPublicDTO(tienda);
  }

  async actualizarTienda(id: number, data: ActualizarTiendaDTO): Promise<TiendaPublicaDTO | null> {
    return this.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    const tienda = await this.em.findOne(Tienda, { idTienda: id });
    if (!tienda) return false;

    await this.em.removeAndFlush(tienda);
    return true;
  }

  async eliminarTienda(id: number): Promise<boolean> {
    return this.delete(id);
  }

  private toPublicDTO(t: Tienda): TiendaPublicaDTO {
    return {
      idTienda: t.idTienda,
      nombre: t.nombre,
      claseTienda: t.claseTienda,
      idClase: t.clase ? t.clase.idClase : null,
    };
  }

  private aTiendaPublica(t: Tienda): TiendaPublicaDTO {
    return this.toPublicDTO(t);
  }
}
