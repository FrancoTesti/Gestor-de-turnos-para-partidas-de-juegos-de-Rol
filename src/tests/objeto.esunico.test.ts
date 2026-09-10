import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Inventario } from '../entities/Inventario.entity';
import { Objeto } from '../entities/Objeto.entity';
import { Partida } from '../entities/Partida.entity';
import { Personaje } from '../entities/Personaje.entity';
import { Tienda } from '../entities/Tienda.entity';
import { ObjetoService } from '../services/objeto.service';
import { ErrorValidacionObjeto } from '../validators/objeto.validator';

describe('ObjetoService - Objeto Único (esUnico)', () => {
  let objetoUnico: Objeto;
  let personaje: Personaje;
  let inventario: Inventario;
  let tienda: Tienda;
  let partida: Partida;

  beforeEach(() => {
    partida = Object.assign(new Partida(), { idPartida: 1, nombre: 'Aventura' });
    tienda = Object.assign(new Tienda(), { idTienda: 1, nombre: 'Armería' });
    personaje = Object.assign(new Personaje(), { idPersonaje: 10, nombreFicticio: 'Heroe', dinero: 500, partida });
    inventario = Object.assign(new Inventario(), { personaje, numInventario: 1, cantidadEspacio: 10 });
    objetoUnico = Object.assign(new Objeto(), {
      idObjeto: 99,
      nombre: 'Anillo Único',
      descripcion: 'Un Anillo para gobernarlos a todos',
      tipoObjeto: 'Reliquia',
      valor: 300,
      nivelObjeto: 10,
      esUnico: true,
      posicion: 0,
      tienda,
      inventario: null,
    });
  });

  it('permite crear y mapear un objeto único con esUnico = true', async () => {
    const em = {
      findOne: vi.fn().mockResolvedValue(tienda),
      create: vi.fn((_cls, data) => Object.assign(new Objeto(), { idObjeto: 100, ...data })),
      flush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    const service = new ObjetoService(em);
    const creado = await service.crearObjeto({
      nombre: 'Anillo Único',
      descripcion: 'Poderoso',
      tipoObjeto: 'Reliquia',
      valor: 300,
      nivelObjeto: 10,
      esUnico: true,
      idTienda: 1,
    });

    expect(creado.esUnico).toBe(true);
  });

  it('rechaza la compra si ya existe el mismo objeto único en la partida', async () => {
    const objetoDuplicadoExistente = Object.assign(new Objeto(), {
      idObjeto: 101,
      nombre: 'Anillo Único',
      esUnico: true,
    });

    const tx = {
      findOne: vi.fn()
        .mockResolvedValueOnce(objetoUnico) // Objeto a comprar
        .mockResolvedValueOnce(personaje) // Personaje comprador
        .mockResolvedValueOnce(objetoDuplicadoExistente), // Objeto ya existente en la partida
      count: vi.fn().mockResolvedValue(0),
      flush: vi.fn(),
    };

    const em = {
      transactional: vi.fn(async (cb: (t: EntityManager) => Promise<unknown>) => cb(tx as unknown as EntityManager)),
    } as unknown as EntityManager;

    const service = new ObjetoService(em);

    await expect(
      service.comprarObjeto(99, { idPersonaje: 10, numInventario: 1, posicion: 0 }),
    ).rejects.toThrow(ErrorValidacionObjeto);

    expect(tx.flush).not.toHaveBeenCalled();
  });

  it('permite la compra si el objeto único no ha sido adquirido por ningún personaje en la partida', async () => {
    const tx = {
      findOne: vi.fn()
        .mockResolvedValueOnce(objetoUnico) // Objeto a comprar
        .mockResolvedValueOnce(personaje) // Personaje comprador
        .mockResolvedValueOnce(null) // No existe objeto único previo en la partida
        .mockResolvedValueOnce(inventario) // Inventario
        .mockResolvedValueOnce(null), // Posición vacía
      count: vi.fn().mockResolvedValue(0),
      flush: vi.fn().mockResolvedValue(undefined),
    };

    const em = {
      transactional: vi.fn(async (cb: (t: EntityManager) => Promise<unknown>) => cb(tx as unknown as EntityManager)),
    } as unknown as EntityManager;

    const service = new ObjetoService(em);

    const resultado = await service.comprarObjeto(99, { idPersonaje: 10, numInventario: 1, posicion: 0 });

    expect(resultado.objeto.esUnico).toBe(true);
    expect(resultado.dineroRestante).toBe(200);
    expect(tx.flush).toHaveBeenCalledOnce();
  });
});
