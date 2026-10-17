import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Clase } from '../entities/Clase.entity';
import { ClaseService } from '../services/clase.service';

describe('ClaseService', () => {
  let clase: Clase;

  beforeEach(() => {
    clase = Object.assign(new Clase(), {
      idClase: 1,
      nombreClase: 'Guerrero',
      descripcionClase: 'Especialista en combate cuerpo a cuerpo',
    });
  });

  function crearServicio(mockClase: Clase | null = clase) {
    const em = {
      find: vi.fn().mockResolvedValue([clase]),
      findOne: vi.fn().mockImplementation((entity, _filter) => {
        if (entity === Clase) return Promise.resolve(mockClase);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((_entity, data) =>
        Object.assign(new Clase(), { idClase: 99, ...data }),
      ),
      assign: vi.fn().mockImplementation((target, data) => Object.assign(target, data)),
      flush: vi.fn().mockResolvedValue(undefined),
      removeAndFlush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    return { service: new ClaseService(em), em };
  }

  it('getAll retorna lista de clases formateadas como DTO público', async () => {
    const { service } = crearServicio();
    const resultado = await service.getAll();
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toEqual({
      idClase: 1,
      nombreClase: 'Guerrero',
      descripcionClase: 'Especialista en combate cuerpo a cuerpo',
    });
  });

  it('getById retorna clase si existe o null si no se encuentra', async () => {
    const { service } = crearServicio();
    const encontrada = await service.getById(1);
    expect(encontrada?.nombreClase).toBe('Guerrero');

    const { service: serviceNoFound } = crearServicio(null);
    expect(await serviceNoFound.getById(999)).toBeNull();
  });

  it('create persiste la entidad y retorna el DTO creado', async () => {
    const { service, em } = crearServicio();
    const creada = await service.create({
      nombreClase: 'Mago',
      descripcionClase: 'Lanza hechizos arcanos',
    });

    expect(em.create).toHaveBeenCalledWith(Clase, {
      nombreClase: 'Mago',
      descripcionClase: 'Lanza hechizos arcanos',
    });
    expect(em.flush).toHaveBeenCalledOnce();
    expect(creada.idClase).toBe(99);
    expect(creada.nombreClase).toBe('Mago');
  });

  it('update modifica campos si la clase existe o retorna null si no existe', async () => {
    const { service, em } = crearServicio();
    const actualizada = await service.update(1, {
      descripcionClase: 'Nueva descripción',
    });

    expect(actualizada?.descripcionClase).toBe('Nueva descripción');
    expect(em.flush).toHaveBeenCalledOnce();

    const { service: serviceNoFound } = crearServicio(null);
    expect(await serviceNoFound.update(999, { nombreClase: 'X' })).toBeNull();
  });

  it('delete borra la clase si existe o retorna false si no existe', async () => {
    const { service, em } = crearServicio();
    const borrado = await service.delete(1);
    expect(borrado).toBe(true);
    expect(em.removeAndFlush).toHaveBeenCalledWith(clase);

    const { service: serviceNoFound } = crearServicio(null);
    expect(await serviceNoFound.delete(999)).toBe(false);
  });
});
