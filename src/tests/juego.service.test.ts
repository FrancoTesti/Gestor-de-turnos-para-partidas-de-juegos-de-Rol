import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Inventario } from '../entities/Inventario.entity';
import { Objeto } from '../entities/Objeto.entity';
import { Personaje } from '../entities/Personaje.entity';
import { Tienda } from '../entities/Tienda.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Jugador } from '../entities/Jugador.entity';
import { JuegoService } from '../services/juego.service';

describe('JuegoService - Inventarios, Movimiento y Ventas', () => {
  let usuario: Usuario;
  let jugador: Jugador;
  let personaje: Personaje;
  let inventario: Inventario;
  let tienda: Tienda;
  let objeto: Objeto;

  beforeEach(() => {
    usuario = Object.assign(new Usuario(), { idUsuario: 1 });
    jugador = Object.assign(new Jugador(), { idUsuario: 1, usuario });
    personaje = Object.assign(new Personaje(), { idPersonaje: 10, jugador, dinero: 100 });
    inventario = Object.assign(new Inventario(), { personaje, numInventario: 1, cantidadEspacio: 5 });
    tienda = Object.assign(new Tienda(), { idTienda: 2, nombre: 'Mercado' });
    objeto = Object.assign(new Objeto(), {
      idObjeto: 50,
      nombre: 'Poción',
      valor: 100,
      inventario,
      posicion: 0,
      tienda: null,
    });
  });

  function crearMockEm(overrides?: {
    findObject?: Objeto | null;
    findPersonaje?: Personaje | null;
    findInventario?: Inventario | null;
    findTienda?: Tienda | null;
    countObjetos?: number;
    findOccupiedPosition?: Objeto | null;
  }) {
    const tx = {
      lock: vi.fn().mockResolvedValue(undefined),
      findOne: vi.fn().mockImplementation((entity, filter) => {
        if (entity === Personaje) return Promise.resolve(overrides?.findPersonaje !== undefined ? overrides.findPersonaje : personaje);
        if (entity === Inventario) return Promise.resolve(overrides?.findInventario !== undefined ? overrides.findInventario : inventario);
        if (entity === Tienda) return Promise.resolve(overrides?.findTienda !== undefined ? overrides.findTienda : tienda);
        if (entity === Objeto) {
          if (filter?.idObjeto !== undefined && typeof filter.idObjeto === 'number') {
            return Promise.resolve(overrides?.findObject !== undefined ? overrides.findObject : objeto);
          }
          if (filter?.posicion !== undefined) {
            return Promise.resolve(overrides?.findOccupiedPosition ?? null);
          }
        }
        return Promise.resolve(null);
      }),
      find: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(overrides?.countObjetos ?? 0),
      create: vi.fn().mockImplementation((_entity, data) => Object.assign(new Inventario(), data)),
      flush: vi.fn().mockResolvedValue(undefined),
      removeAndFlush: vi.fn().mockResolvedValue(undefined),
    };

    const em = {
      transactional: vi.fn(async (cb: (tx: EntityManager) => Promise<unknown>) => cb(tx as unknown as EntityManager)),
      findOne: vi.fn().mockImplementation(tx.findOne),
    } as unknown as EntityManager;

    return { service: new JuegoService(em), em, tx };
  }

  describe('saveInventory', () => {
    it('crea un nuevo inventario para el personaje', async () => {
      const { service, tx } = crearMockEm({ findInventario: null });
      const res = await service.saveInventory(1, { idPersonaje: 10, numInventario: 2, cantidadEspacio: 10 });
      expect(res).toEqual({ idPersonaje: 10, numInventario: 2, cantidadEspacio: 10 });
      expect(tx.flush).toHaveBeenCalledOnce();
    });

    it('rechaza reducir la capacidad si hay objetos en posiciones mayores o iguales a la nueva capacidad', async () => {
      const { service } = crearMockEm({ countObjetos: 1 });
      await expect(service.saveInventory(1, { idPersonaje: 10, numInventario: 1, cantidadEspacio: 2 }, true))
        .rejects.toThrow('Mové los objetos antes de reducir la capacidad');
    });
  });

  describe('deleteInventory', () => {
    it('elimina un inventario vacío', async () => {
      const { service, tx } = crearMockEm({ countObjetos: 0 });
      await service.deleteInventory(1, 10, 1);
      expect(tx.removeAndFlush).toHaveBeenCalledWith(inventario);
    });

    it('rechaza eliminar un inventario con objetos', async () => {
      const { service } = crearMockEm({ countObjetos: 3 });
      await expect(service.deleteInventory(1, 10, 1))
        .rejects.toThrow('El inventario debe estar vacío');
    });
  });

  describe('moveObject', () => {
    it('mueve un objeto a otra posición válida del inventario', async () => {
      const { service, tx } = crearMockEm();
      const res = await service.moveObject(1, 10, 1, { idObjeto: 50, posicion: 3 });
      expect(res.posicion).toBe(3);
      expect(objeto.posicion).toBe(3);
      expect(tx.flush).toHaveBeenCalledOnce();
    });

    it('rechaza mover si la posición está fuera del límite de capacidad', async () => {
      const { service } = crearMockEm();
      await expect(service.moveObject(1, 10, 1, { idObjeto: 50, posicion: 10 }))
        .rejects.toThrow('La posición está fuera del inventario');
    });

    it('rechaza mover si la posición está ocupada por otro objeto', async () => {
      const ocupado = Object.assign(new Objeto(), { idObjeto: 99, posicion: 2 });
      const { service } = crearMockEm({ findOccupiedPosition: ocupado });
      await expect(service.moveObject(1, 10, 1, { idObjeto: 50, posicion: 2 }))
        .rejects.toThrow('La posición está ocupada');
    });
  });

  describe('sell', () => {
    it('vende un objeto acreditando dinero y asignándolo a la tienda', async () => {
      const { service, tx } = crearMockEm();
      const res = await service.sell(1, 50, { idPersonaje: 10, idTienda: 2, precio: 80 });
      expect(res.dineroRestante).toBe(180);
      expect(objeto.inventario).toBeNull();
      expect(objeto.tienda).toBe(tienda);
      expect(tx.flush).toHaveBeenCalledOnce();
    });

    it('rechaza vender si el precio está fuera del rango 70% - 100%', async () => {
      const { service } = crearMockEm();
      // Objeto de valor 100 -> rango [70, 100]
      await expect(service.sell(1, 50, { idPersonaje: 10, idTienda: 2, precio: 50 }))
        .rejects.toThrow(/70–100 %/);
    });

    it('rechaza vender un objeto que ya está en la tienda o no pertenece al personaje', async () => {
      objeto.inventario = null;
      objeto.tienda = tienda;
      const { service } = crearMockEm();
      await expect(service.sell(1, 50, { idPersonaje: 10, idTienda: 2, precio: 80 }))
        .rejects.toThrow('El objeto no está en tu inventario');
    });
  });
});
