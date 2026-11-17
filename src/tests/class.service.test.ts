import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Class } from '../entities/Class.entity';
import { ClassService } from '../services/class.service';

describe('ClassService', () => {
  let clase: Class;

  beforeEach(() => {
    clase = Object.assign(new Class(), {
      idClase: 1,
      nombreClase: 'Guerrero',
      descripcionClase: 'Especialista en combate cuerpo a cuerpo',
    });
  });

  function createService(mockClase: Class | null = clase) {
    const em = {
      find: vi.fn().mockResolvedValue([clase]),
      findOne: vi.fn().mockImplementation((entity, _filter) => {
        if (entity === Class) return Promise.resolve(mockClase);
        return Promise.resolve(null);
      }),
      create: vi.fn().mockImplementation((_entity, data) =>
        Object.assign(new Class(), { idClase: 99, ...data }),
      ),
      assign: vi.fn().mockImplementation((target, data) => Object.assign(target, data)),
      flush: vi.fn().mockResolvedValue(undefined),
      removeAndFlush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    return { service: new ClassService(em), em };
  }

  it('getAll retorna lista de clases formateadas como DTO público', async () => {
    const { service } = createService();
    const resultado = await service.getAll();
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toEqual({
      idClase: 1,
      nombreClase: 'Guerrero',
      descripcionClase: 'Especialista en combate cuerpo a cuerpo',
    });
  });

  it('getById retorna clase si existe o null si no se encuentra', async () => {
    const { service } = createService();
    const encontrada = await service.getById(1);
    expect(encontrada?.nombreClase).toBe('Guerrero');

    const { service: serviceNoFound } = createService(null);
    expect(await serviceNoFound.getById(999)).toBeNull();
  });

  it('createClass persiste la entidad y retorna el DTO creado', async () => {
    const { service, em } = createService();
    const creada = await service.createClass({
      nombreClase: 'Mago',
      descripcionClase: 'Lanza hechizos arcanos',
    });

    expect(em.create).toHaveBeenCalledWith(Class, {
      nombreClase: 'Mago',
      descripcionClase: 'Lanza hechizos arcanos',
    });
    expect(em.flush).toHaveBeenCalledOnce();
    expect(creada.idClase).toBe(99);
    expect(creada.nombreClase).toBe('Mago');
  });

  it('updateClass modifica campos si la clase existe o retorna null si no existe', async () => {
    const { service, em } = createService();
    const actualizada = await service.updateClass(1, {
      descripcionClase: 'Nueva descripción',
    });

    expect(actualizada?.descripcionClase).toBe('Nueva descripción');
    expect(em.flush).toHaveBeenCalledOnce();

    const { service: serviceNoFound } = createService(null);
    expect(await serviceNoFound.updateClass(999, { nombreClase: 'X' })).toBeNull();
  });

  it('deleteClass borra la clase si existe o retorna false si no existe', async () => {
    const { service, em } = createService();
    const borrado = await service.deleteClass(1);
    expect(borrado).toBe(true);
    expect(em.removeAndFlush).toHaveBeenCalledWith(clase);

    const { service: serviceNoFound } = createService(null);
    expect(await serviceNoFound.deleteClass(999)).toBe(false);
  });
});
