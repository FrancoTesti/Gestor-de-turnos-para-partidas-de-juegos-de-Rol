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
  async obtenerTodos(): Promise<ClasePublicaDTO[]> {
    return this.getAll();
  }

  async getById(id: number): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    return clase ? this.toPublicClass(clase) : null;
  }
  async obtenerPorId(id: number): Promise<ClasePublicaDTO | null> {
    return this.getById(id);
  }

  async createClass(data: CrearClaseDTO): Promise<ClasePublicaDTO> {
    const clase = this.em.create(Clase, data);
    await this.em.flush();
    return this.toPublicClass(clase);
  }
  async crearClase(data: CrearClaseDTO): Promise<ClasePublicaDTO> {
    return this.createClass(data);
  }

  async updateClass(id: number, data: ActualizarClaseDTO): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return null;

    this.em.assign(clase, data);
    await this.em.flush();
    return this.toPublicClass(clase);
  }
  async actualizarClase(id: number, data: ActualizarClaseDTO): Promise<ClasePublicaDTO | null> {
    return this.updateClass(id, data);
  }

  async deleteClass(id: number): Promise<boolean> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return false;

    await this.em.removeAndFlush(clase);
    return true;
  }
  async eliminarClase(id: number): Promise<boolean> {
    return this.deleteClass(id);
  }

  private toPublicClass(c: Clase): ClasePublicaDTO {
    return {
      idClase: c.idClase,
      nombreClase: c.nombreClase,
      descripcionClase: c.descripcionClase,
    };
  }
  private aClasePublica(c: Clase): ClasePublicaDTO {
    return this.toPublicClass(c);
  }
}

export { ClaseService as ClassService };
