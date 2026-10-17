import { EntityManager } from '@mikro-orm/core';
import { Clase } from '../entities/Clase.entity';
import type { ActualizarClaseDTO, ClasePublicaDTO, CrearClaseDTO } from '../types/clase.dto';

export class ClaseService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async getAll(): Promise<ClasePublicaDTO[]> {
    const clases = await this.em.find(Clase, {});
    return clases.map((c) => this.toPublicDTO(c));
  }

  async obtenerTodos(): Promise<ClasePublicaDTO[]> {
    return this.getAll();
  }

  async getById(id: number): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    return clase ? this.toPublicDTO(clase) : null;
  }

  async obtenerPorId(id: number): Promise<ClasePublicaDTO | null> {
    return this.getById(id);
  }

  async create(data: CrearClaseDTO): Promise<ClasePublicaDTO> {
    const clase = this.em.create(Clase, data);
    await this.em.flush();
    return this.toPublicDTO(clase);
  }

  async crearClase(data: CrearClaseDTO): Promise<ClasePublicaDTO> {
    return this.create(data);
  }

  async update(id: number, data: ActualizarClaseDTO): Promise<ClasePublicaDTO | null> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return null;

    this.em.assign(clase, data);
    await this.em.flush();
    return this.toPublicDTO(clase);
  }

  async actualizarClase(id: number, data: ActualizarClaseDTO): Promise<ClasePublicaDTO | null> {
    return this.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    const clase = await this.em.findOne(Clase, { idClase: id });
    if (!clase) return false;

    await this.em.removeAndFlush(clase);
    return true;
  }

  async eliminarClase(id: number): Promise<boolean> {
    return this.delete(id);
  }

  private toPublicDTO(c: Clase): ClasePublicaDTO {
    return {
      idClase: c.idClase,
      nombreClase: c.nombreClase,
      descripcionClase: c.descripcionClase,
    };
  }

  private aClasePublica(c: Clase): ClasePublicaDTO {
    return this.toPublicDTO(c);
  }
}
