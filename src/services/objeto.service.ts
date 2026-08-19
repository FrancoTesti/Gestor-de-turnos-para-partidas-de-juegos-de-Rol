import { EntityManager } from '@mikro-orm/core';
import { Objeto } from '../entities/Objeto.entity';
import { Tienda } from '../entities/Tienda.entity';
import type { ActualizarObjetoDTO, CrearObjetoDTO, ObjetoPublicoDTO } from '../types/objeto.dto';

export class ObjetoService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(): Promise<ObjetoPublicoDTO[]> {
    const objetos = await this.em.find(Objeto, {}, { populate: ['tienda'] });
    return objetos.map((o) => this.aObjetoPublico(o));
  }

  async obtenerPorId(id: number): Promise<ObjetoPublicoDTO | null> {
    const objeto = await this.em.findOne(Objeto, { idObjeto: id }, { populate: ['tienda'] });
    return objeto ? this.aObjetoPublico(objeto) : null;
  }

  async crearObjeto(data: CrearObjetoDTO): Promise<ObjetoPublicoDTO> {
    let tienda: Tienda | null = null;
    if (data.idTienda) {
      tienda = await this.em.findOne(Tienda, { idTienda: data.idTienda });
    }

    const objeto = this.em.create(Objeto, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoObjeto: data.tipoObjeto,
      valor: data.valor,
      nivelObjeto: data.nivelObjeto,
      posicion: data.posicion ?? 0,
      tienda,
    });

    await this.em.flush();
    return this.aObjetoPublico(objeto);
  }

  async actualizarObjeto(id: number, data: ActualizarObjetoDTO): Promise<ObjetoPublicoDTO | null> {
    const objeto = await this.em.findOne(Objeto, { idObjeto: id });
    if (!objeto) return null;

    if (data.idTienda !== undefined) {
      objeto.tienda = data.idTienda ? await this.em.findOne(Tienda, { idTienda: data.idTienda }) : null;
    }

    if (data.nombre !== undefined) objeto.nombre = data.nombre;
    if (data.descripcion !== undefined) objeto.descripcion = data.descripcion;
    if (data.tipoObjeto !== undefined) objeto.tipoObjeto = data.tipoObjeto;
    if (data.valor !== undefined) objeto.valor = data.valor;
    if (data.nivelObjeto !== undefined) objeto.nivelObjeto = data.nivelObjeto;
    if (data.posicion !== undefined) objeto.posicion = data.posicion;

    await this.em.flush();
    return this.aObjetoPublico(objeto);
  }

  async eliminarObjeto(id: number): Promise<boolean> {
    const objeto = await this.em.findOne(Objeto, { idObjeto: id });
    if (!objeto) return false;

    await this.em.removeAndFlush(objeto);
    return true;
  }

  private aObjetoPublico(o: Objeto): ObjetoPublicoDTO {
    return {
      idObjeto: o.idObjeto,
      nombre: o.nombre,
      descripcion: o.descripcion,
      tipoObjeto: o.tipoObjeto,
      valor: o.valor,
      nivelObjeto: o.nivelObjeto,
      idTienda: o.tienda ? o.tienda.idTienda : null,
      posicion: o.posicion,
    };
  }
}
