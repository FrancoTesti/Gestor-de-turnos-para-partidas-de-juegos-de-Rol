import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Inventario } from '../entities/Inventory.entity';
import { Objeto } from '../entities/Item.entity';
import { Personaje } from '../entities/Character.entity';
import { Tienda } from '../entities/Shop.entity';
import {
  DineroInsuficienteError,
  InventarioLlenoError,
  ObjetoService,
  PosicionOcupadaError,
  NivelInsuficienteError,
} from '../services/item.service';

describe('ObjetoService.comprarObjeto', () => {
  let objeto: Objeto;
  let personaje: Personaje;
  let inventario: Inventario;
  let tienda: Tienda;

  beforeEach(() => {
    tienda = Object.assign(new Tienda(), { idTienda: 1, nombre: 'Armería', claseTienda: 'general' });
    personaje = Object.assign(new Personaje(), { idPersonaje: 10, nombreFicticio: 'Arthas', dinero: 100, nivel: 1 });
    inventario = Object.assign(new Inventario(), { personaje, numInventario: 1, cantidadEspacio: 2 });
    objeto = Object.assign(new Objeto(), {
      idObjeto: 5,
      nombre: 'Espada',
      descripcion: 'Espada de hierro',
      tipoObjeto: 'Arma',
      valor: 40,
      nivelObjeto: 1,
      esUnico: true,
      posicion: 0,
      tienda,
      inventario: null,
    });
  });

  function crearServicio(options?: { cantidad?: number; posicionOcupada?: Objeto | null; errorFlush?: Error }) {
    const tx = {
      findOne: vi.fn()
        .mockResolvedValueOnce(objeto)
        .mockResolvedValueOnce(personaje)
        .mockResolvedValueOnce(inventario)
        .mockResolvedValueOnce(options?.posicionOcupada ?? null),
      find: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(options?.cantidad ?? 0),
      create: vi.fn((_cls, data) => Object.assign(new Objeto(), { idObjeto: 999, ...data })),
      flush: options?.errorFlush ? vi.fn().mockRejectedValue(options.errorFlush) : vi.fn().mockResolvedValue(undefined),
    };
    const em = {
      transactional: vi.fn(async (callback: (transaction: EntityManager) => Promise<unknown>) =>
        callback(tx as unknown as EntityManager)),
    } as unknown as EntityManager;

    return { service: new ObjetoService(em), em, tx };
  }

  it('compra el objeto, descuenta el dinero y lo mueve al inventario', async () => {
    const { service, em, tx } = crearServicio();

    const resultado = await service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 });

    expect(em.transactional).toHaveBeenCalledOnce();
    expect(personaje.dinero).toBe(60);
    expect(objeto.tienda).toBeNull();
    expect(objeto.inventario).toBe(inventario);
    expect(objeto.posicion).toBe(1);
    expect(tx.flush).toHaveBeenCalledOnce();
    expect(resultado).toMatchObject({ idPersonaje: 10, numInventario: 1, dineroRestante: 60 });
  });

  it('rechaza la compra si el personaje no tiene dinero suficiente', async () => {
    personaje.dinero = 20;
    const { service, tx } = crearServicio();

    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 }))
      .rejects.toThrow(DineroInsuficienteError);

    expect(personaje.dinero).toBe(20);
    expect(objeto.tienda).toBe(tienda);
    expect(tx.flush).not.toHaveBeenCalled();
  });

  it('rechaza la compra si el inventario está lleno', async () => {
    const { service, tx } = crearServicio({ cantidad: 2 });

    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 }))
      .rejects.toThrow(InventarioLlenoError);

    expect(personaje.dinero).toBe(100);
    expect(objeto.inventario).toBeNull();
    expect(tx.flush).not.toHaveBeenCalled();
  });

  it('rechaza la compra si la posición ya está ocupada', async () => {
    const ocupado = Object.assign(new Objeto(), { idObjeto: 8 });
    const { service, tx } = crearServicio({ posicionOcupada: ocupado });

    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 }))
      .rejects.toThrow(PosicionOcupadaError);

    expect(personaje.dinero).toBe(100);
    expect(tx.flush).not.toHaveBeenCalled();
  });

  it('propaga un error de escritura (el rollback real se prueba contra MySQL)', async () => {
    const { service } = crearServicio({ errorFlush: new Error('Fallo de base de datos') });
    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 }))
      .rejects.toThrow('Fallo de base de datos');
  });

  it('rechaza posiciones fuera de capacidad sin escribir', async () => {
    const { service, tx } = crearServicio();
    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 2 })).rejects.toThrow('capacidad');
    expect(tx.flush).not.toHaveBeenCalled();
  });

  it('permite comprar infinitamente un objeto no único (esUnico: false) creando una copia y manteniendo el original en la tienda', async () => {
    objeto.esUnico = false;
    const { service, tx } = crearServicio();

    const resultado = await service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 });

    expect(personaje.dinero).toBe(60);
    // El objeto original permanece en la tienda
    expect(objeto.tienda).toBe(tienda);
    expect(objeto.inventario).toBeNull();
    // Se creó una nueva instancia para el inventario
    expect(tx.create).toHaveBeenCalledWith(Objeto, expect.objectContaining({
      nombre: 'Espada',
      esUnico: false,
      posicion: 1,
      tienda: null,
      inventario,
    }));
    expect(tx.flush).toHaveBeenCalledOnce();
    expect(resultado.objeto.idObjeto).toBe(999);
  });

  it('asigna automáticamente la primera posición libre cuando no se envía posicion', async () => {
    objeto.esUnico = true;
    const { service, tx } = crearServicio();
    tx.find = vi.fn().mockResolvedValue([{ posicion: 0 }]);

    const resultado = await service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1 });

    expect(objeto.posicion).toBe(1);
    expect(resultado.objeto.posicion).toBe(1);
  });

  it('rechaza la compra si el nivel del personaje es inferior al nivel del objeto', async () => {
    personaje.nivel = 1;
    objeto.nivelObjeto = 5;
    const { service, tx } = crearServicio();

    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 }))
      .rejects.toThrow(NivelInsuficienteError);

    expect(personaje.dinero).toBe(100);
    expect(tx.flush).not.toHaveBeenCalled();
  });
});

