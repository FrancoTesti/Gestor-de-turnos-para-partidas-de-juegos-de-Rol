import { EntityManager, LockMode } from '@mikro-orm/core';
import { Inventario } from '../entities/Inventario.entity';
import { Objeto } from '../entities/Objeto.entity';
import { Personaje } from '../entities/Personaje.entity';
import { Tienda } from '../entities/Tienda.entity';
import { ErrorValidacionObjeto, validarCompraObjeto } from '../validators/objeto.validator';
import type {
  ActualizarObjetoDTO,
  ComprarObjetoDTO,
  CrearObjetoDTO,
  ObjetoPublicoDTO,
  ResultadoCompraObjetoDTO,
} from '../types/objeto.dto';

export class ObjetoNoEncontradoError extends Error {
  constructor() {
    super('Objeto no encontrado');
    this.name = 'ObjetoNoEncontradoError';
  }
}

export class ObjetoNoDisponibleError extends Error {
  constructor() {
    super('El objeto no está disponible para comprar');
    this.name = 'ObjetoNoDisponibleError';
  }
}

export class PersonajeNoEncontradoError extends Error {
  constructor() {
    super('Personaje no encontrado');
    this.name = 'PersonajeNoEncontradoError';
  }
}

export class InventarioNoEncontradoError extends Error {
  constructor() {
    super('El inventario indicado no pertenece al personaje');
    this.name = 'InventarioNoEncontradoError';
  }
}

export class DineroInsuficienteError extends Error {
  constructor() {
    super('El personaje no tiene dinero suficiente');
    this.name = 'DineroInsuficienteError';
  }
}

export class InventarioLlenoError extends Error {
  constructor() {
    super('El inventario no tiene espacio disponible');
    this.name = 'InventarioLlenoError';
  }
}

export class PosicionOcupadaError extends Error {
  constructor() {
    super('La posición elegida ya está ocupada');
    this.name = 'PosicionOcupadaError';
  }
}

export class ObjetoService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(): Promise<ObjetoPublicoDTO[]> {
    const objetos = await this.em.find(Objeto, {}, { populate: ['tienda', 'inventario.personaje'] });
    return objetos.map((o) => this.aObjetoPublico(o));
  }

  async obtenerPorId(id: number): Promise<ObjetoPublicoDTO | null> {
    const objeto = await this.em.findOne(Objeto, { idObjeto: id }, { populate: ['tienda', 'inventario.personaje'] });
    return objeto ? this.aObjetoPublico(objeto) : null;
  }

  async crearObjeto(data: CrearObjetoDTO): Promise<ObjetoPublicoDTO> {
    let tienda: Tienda | null = null;
    if (data.idTienda != null) {
      tienda = await this.em.findOne(Tienda, { idTienda: data.idTienda });
      if (!tienda) throw new ErrorValidacionObjeto('La tienda indicada no existe');
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

    if (objeto.inventario) throw new ErrorValidacionObjeto('No se puede editar un objeto dentro de un inventario');

    if (data.idTienda !== undefined) {
      objeto.tienda = data.idTienda ? await this.em.findOne(Tienda, { idTienda: data.idTienda }) : null;
      if (data.idTienda && !objeto.tienda) throw new ErrorValidacionObjeto('La tienda indicada no existe');
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

  async obtenerSugeridos(idClase: number): Promise<ObjetoPublicoDTO[]> {
    // La relación Inventario tiene clave compuesta; evitar comparar la tupla con NULL en MySQL.
    const objetos = await this.em.find(Objeto, { tienda: { clase: { idClase } } }, { populate: ['tienda', 'inventario.personaje'] });
    return objetos.filter(o => !o.inventario).map(o => this.aObjetoPublico(o));
  }

  async comprarObjeto(idObjeto: number, data: ComprarObjetoDTO): Promise<ResultadoCompraObjetoDTO> {
    data = validarCompraObjeto(data);
    return this.em.transactional(async (em) => {
      const objeto = await em.findOne(
        Objeto,
        { idObjeto },
        { populate: ['tienda', 'inventario.personaje'], lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (!objeto) throw new ObjetoNoEncontradoError();
      if (!objeto.tienda || objeto.inventario) throw new ObjetoNoDisponibleError();

      const personaje = await em.findOne(
        Personaje,
        { idPersonaje: data.idPersonaje },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (!personaje) throw new PersonajeNoEncontradoError();

      const inventario = await em.findOne(
        Inventario,
        { personaje, numInventario: data.numInventario },
        { populate: ['personaje'], lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (!inventario) throw new InventarioNoEncontradoError();
      if (data.posicion >= inventario.cantidadEspacio) throw new ErrorValidacionObjeto('La posición debe ser menor que la capacidad del inventario');
      if (personaje.dinero < objeto.valor) throw new DineroInsuficienteError();

      const objetosGuardados = await em.count(Objeto, { inventario });
      if (objetosGuardados >= inventario.cantidadEspacio) throw new InventarioLlenoError();

      const objetoEnPosicion = await em.findOne(
        Objeto,
        { inventario, posicion: data.posicion },
        { lockMode: LockMode.PESSIMISTIC_WRITE },
      );
      if (objetoEnPosicion) throw new PosicionOcupadaError();

      personaje.dinero -= objeto.valor;
      objeto.tienda = null;
      objeto.inventario = inventario;
      objeto.posicion = data.posicion;

      await em.flush();

      return {
        objeto: this.aObjetoPublico(objeto),
        idPersonaje: personaje.idPersonaje,
        numInventario: inventario.numInventario,
        dineroRestante: personaje.dinero,
      };
    });
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
      idPersonaje: o.inventario ? o.inventario.personaje.idPersonaje : null,
      numInventario: o.inventario ? o.inventario.numInventario : null,
      posicion: o.posicion,
    };
  }
}
