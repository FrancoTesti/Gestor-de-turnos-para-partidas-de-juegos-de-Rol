import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Clase } from '../entities/Clase.entity';
import { Tienda } from '../entities/Tienda.entity';
import { TiendaService } from '../services/tienda.service';
import { ErrorValidacionTienda } from '../validators/tienda.validator';

describe('TiendaService', () => {
  let clase: Clase;
  let tienda: Tienda;

  beforeEach(() => {
    clase = Object.assign(new Clase(), { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Combate' });
    tienda = Object.assign(new Tienda(), { idTienda: 10, nombre: 'Armería', claseTienda: 'Armas', clase });
  });

  function crearServicio(mockTienda: Tienda | null = tienda, mockClase: Clase | null = clase) {
    const em = {
      find: vi.fn().mockResolvedValue([tienda]),
      findOne: vi.fn().mockImplementation((entity, filter) => {
        if (entity === Tienda) return Promise.resolve(mockTienda);
        if (entity === Clase) return Promise.resolve(mockClase);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((_entity, data) => Object.assign(new Tienda(), { idTienda: 99, ...data })),
      flush: vi.fn().mockResolvedValue(undefined),
      removeAndFlush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    return { service: new TiendaService(em), em };
  }

  it('getAll lista tiendas formateadas', async () => {
    const { service } = crearServicio();
    const resultado = await service.getAll();
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toEqual({
      idTienda: 10,
      nombre: 'Armería',
      claseTienda: 'Armas',
      idClase: 1,
    });
  });

  it('getById retorna tienda si existe o null si no existe', async () => {
    const { service } = crearServicio();
    const encontrada = await service.getById(10);
    expect(encontrada?.nombre).toBe('Armería');

    const { service: serviceNoFound } = crearServicio(null);
    expect(await serviceNoFound.getById(999)).toBeNull();
  });

  it('create crea tienda asignando la clase si existe', async () => {
    const { service, em } = crearServicio();
    const creada = await service.create({ nombre: 'Forja', claseTienda: 'Armas', idClase: 1 });
    expect(em.create).toHaveBeenCalledWith(Tienda, {
      nombre: 'Forja',
      claseTienda: 'Armas',
      clase,
    });
    expect(em.flush).toHaveBeenCalledOnce();
    expect(creada.idTienda).toBe(99);
  });

  it('create falla si la clase indicada no existe', async () => {
    const { service } = crearServicio(tienda, null);
    await expect(service.create({ nombre: 'Forja', claseTienda: 'Armas', idClase: 999 }))
      .rejects.toThrow(ErrorValidacionTienda);
  });

  it('update modifica campos y clase vinculada', async () => {
    const { service, em } = crearServicio();
    const actualizada = await service.update(10, { nombre: 'Super Forja', idClase: 1 });
    expect(actualizada?.nombre).toBe('Super Forja');
    expect(em.flush).toHaveBeenCalledOnce();
  });

  it('delete elimina la tienda existente', async () => {
    const { service, em } = crearServicio();
    const borrado = await service.delete(10);
    expect(borrado).toBe(true);
    expect(em.removeAndFlush).toHaveBeenCalledWith(tienda);
  });
});
