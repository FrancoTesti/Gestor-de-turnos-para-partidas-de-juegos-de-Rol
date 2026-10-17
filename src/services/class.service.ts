import { EntityManager } from '@mikro-orm/core';
import { Clase } from '../entities/Class.entity';
import type { ActualizarClaseDTO, ClasePublicaDTO, CrearClaseDTO } from '../types/class.dto';

export class ClaseService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async getAll(): Promise<ClasePublicaDTO[]> {
    const clases = await this.em.find(Clase, {});
    return clases.map((c) => this.toPublicClass(c));
  }

  async getById(id: number): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    return clase ? this.toPublicClass(clase) : null;
  }

  async createClass(data: CrearClaseDTO): Promise<ClasePublicaDTO> {
    const clase = this.em.create(Clase, data);
    await this.em.flush();
    return this.toPublicClass(clase);
  }

  async updateClass(id: number, data: ActualizarClaseDTO): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return null;

    this.em.assign(clase, data);
    await this.em.flush();
    return this.toPublicClass(clase);
  }

  async deleteClass(id: number): Promise<boolean> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return false;

    await this.em.removeAndFlush(clase);
    return true;
  }

  private toPublicClass(c: Clase): ClasePublicaDTO {
    return {
      idClase: c.idClase,
      nombreClase: c.nombreClase,
      descripcionClase: c.descripcionClase,
    };
  }
}

export { ClaseService as ClassService };
