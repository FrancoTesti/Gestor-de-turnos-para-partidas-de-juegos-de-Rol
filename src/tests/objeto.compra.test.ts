import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Inventario } from '../entities/Inventario.entity';
import { Objeto } from '../entities/Objeto.entity';
import { Personaje } from '../entities/Personaje.entity';
import { Tienda } from '../entities/Tienda.entity';
import {
  DineroInsuficienteError,
  InventarioLlenoError,
  ObjetoService,
  PosicionOcupadaError,
} from '../services/objeto.service';

describe('ObjetoService.comprarObjeto', () => {
  let objeto: Objeto;
  let personaje: Personaje;
  let inventario: Inventario;
  let tienda: Tienda;

  beforeEach(() => {
    tienda = Object.assign(new Tienda(), { idTienda: 1, nombre: 'Armería', claseTienda: 'general' });
    personaje = Object.assign(new Personaje(), { idPersonaje: 10, nombreFicticio: 'Arthas', dinero: 100 });
    inventario = Object.assign(new Inventario(), { personaje, numInventario: 1, cantidadEspacio: 2 });
    objeto = Object.assign(new Objeto(), {
      idObjeto: 5,
      nombre: 'Espada',
      descripcion: 'Espada de hierro',
      tipoObjeto: 'Arma',
      valor: 40,
      nivelObjeto: 1,
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
      count: vi.fn().mockResolvedValue(options?.cantidad ?? 0),
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

  it('revierte dinero y ubicación si falla la escritura dentro de la transacción', async () => {
    const tx = {
      findOne: vi.fn()
        .mockResolvedValueOnce(objeto)
        .mockResolvedValueOnce(personaje)
        .mockResolvedValueOnce(inventario)
        .mockResolvedValueOnce(null),
      count: vi.fn().mockResolvedValue(0),
      flush: vi.fn().mockRejectedValue(new Error('Fallo de base de datos')),
    };
    const em = {
      transactional: vi.fn(async (callback: (transaction: EntityManager) => Promise<unknown>) => {
        const dineroAnterior = personaje.dinero;
        const tiendaAnterior = objeto.tienda;
        const inventarioAnterior = objeto.inventario;
        const posicionAnterior = objeto.posicion;
        try {
          return await callback(tx as unknown as EntityManager);
        } catch (error) {
          personaje.dinero = dineroAnterior;
          objeto.tienda = tiendaAnterior;
          objeto.inventario = inventarioAnterior;
          objeto.posicion = posicionAnterior;
          throw error;
        }
      }),
    } as unknown as EntityManager;
    const service = new ObjetoService(em);

    await expect(service.comprarObjeto(5, { idPersonaje: 10, numInventario: 1, posicion: 1 }))
      .rejects.toThrow('Fallo de base de datos');

    expect(personaje.dinero).toBe(100);
    expect(objeto.tienda).toBe(tienda);
    expect(objeto.inventario).toBeNull();
    expect(objeto.posicion).toBe(0);
  });
});
