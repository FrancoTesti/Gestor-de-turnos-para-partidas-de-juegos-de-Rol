import type { EntityManager } from '@mikro-orm/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Clase } from '../entities/Clase.entity';
import { Jugador } from '../entities/Jugador.entity';
import { Partida } from '../entities/Partida.entity';
import { Personaje } from '../entities/Personaje.entity';
import { Usuario } from '../entities/Usuario.entity';
import { Inventario } from '../entities/Inventario.entity';
import { Objeto } from '../entities/Objeto.entity';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';
import { PersonajeService, ErrorReferenciaNoEncontrada } from '../services/personaje.service';
import { ErrorValidacionPersonaje } from '../validators/personaje.validator';
import * as passwordSecurity from '../security/password';

describe('PersonajeService', () => {
  let clase: Clase;
  let usuario: Usuario;
  let jugador: Jugador;
  let partida: Partida;
  let personaje: Personaje;

  beforeEach(() => {
    clase = Object.assign(new Clase(), {
      idClase: 1,
      nombreClase: 'Guerrero',
      descripcionClase: 'Combate',
    });

    usuario = Object.assign(new Usuario(), {
      idUsuario: 10,
      nickname: 'jugador1',
      nombreUsuario: 'Juan Perez',
    });

    jugador = Object.assign(new Jugador(), {
      idUsuario: 10,
      usuario,
      estado: true,
    });

    partida = Object.assign(new Partida(), {
      idPartida: 20,
      nombre: 'Partida Épica',
      estado: true,
      limiteJugadores: 4,
      contrasena: '',
    });

    personaje = Object.assign(new Personaje(), {
      idPersonaje: 100,
      nombreFicticio: 'Thorin',
      raza: 'Enano',
      nivel: 1,
      xp: 0,
      dinero: 100,
      clase,
      jugador,
      partida,
    });
  });

  function crearEm(opciones: {
    mockPersonaje?: Personaje | null;
    mockClase?: Clase | null;
    mockJugador?: Jugador | null;
    mockPartida?: Partida | null;
    countPartidaPersonajes?: number;
    countJugadorPartidaPersonajes?: number;
    countSesiones?: number;
    countObjetos?: number;
  } = {}) {
    const mockPersonaje = opciones.mockPersonaje !== undefined ? opciones.mockPersonaje : personaje;
    const mockClase = opciones.mockClase !== undefined ? opciones.mockClase : clase;
    const mockJugador = opciones.mockJugador !== undefined ? opciones.mockJugador : jugador;
    const mockPartida = opciones.mockPartida !== undefined ? opciones.mockPartida : partida;
    const countPartidaPersonajes = opciones.countPartidaPersonajes ?? 0;
    const countJugadorPartidaPersonajes = opciones.countJugadorPartidaPersonajes ?? 0;
    const countSesiones = opciones.countSesiones ?? 0;
    const countObjetos = opciones.countObjetos ?? 0;

    const em = {
      find: vi.fn().mockImplementation((entity) => {
        if (entity === Personaje) return Promise.resolve(mockPersonaje ? [mockPersonaje] : []);
        if (entity === Inventario) return Promise.resolve([]);
        return Promise.resolve([]);
      }),
      findOne: vi.fn().mockImplementation((entity) => {
        if (entity === Personaje) return Promise.resolve(mockPersonaje);
        if (entity === Clase) return Promise.resolve(mockClase);
        if (entity === Jugador) return Promise.resolve(mockJugador);
        if (entity === Partida) return Promise.resolve(mockPartida);
        return Promise.resolve(null);
      }),
      count: vi.fn().mockImplementation((entity, filter) => {
        if (entity === Personaje) {
          if (filter.jugador) return Promise.resolve(countJugadorPartidaPersonajes);
          return Promise.resolve(countPartidaPersonajes);
        }
        if (entity === PersonajeSesion) return Promise.resolve(countSesiones);
        if (entity === Objeto) return Promise.resolve(countObjetos);
        return Promise.resolve(0);
      }),
      create: vi.fn().mockImplementation((entity, data) => {
        if (entity === Personaje) return Object.assign(new Personaje(), { idPersonaje: 99, ...data });
        if (entity === Inventario) return Object.assign(new Inventario(), { idInventario: 1, ...data });
        return data;
      }),
      flush: vi.fn().mockResolvedValue(undefined),
      populate: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
      removeAndFlush: vi.fn().mockResolvedValue(undefined),
      transactional: vi.fn().mockImplementation(async (cb) => cb(em)),
    } as unknown as EntityManager;

    return { service: new PersonajeService(em), em };
  }

  it('obtenerTodos lista los personajes formateados', async () => {
    const { service } = crearEm();
    const resultado = await service.obtenerTodos();
    expect(resultado).toHaveLength(1);
    expect(resultado[0]).toEqual({
      idPersonaje: 100,
      nombreFicticio: 'Thorin',
      raza: 'Enano',
      nivel: 1,
      xp: 0,
      dinero: 100,
      idClase: 1,
      claseNombre: 'Guerrero',
      idUsuarioJugador: 10,
      jugadorNombre: 'jugador1',
      idPartida: 20,
      partidaNombre: 'Partida Épica',
    });
  });

  it('obtenerPorId retorna el personaje si existe o null', async () => {
    const { service } = crearEm();
    const p = await service.obtenerPorId(100);
    expect(p?.nombreFicticio).toBe('Thorin');

    const { service: serviceNull } = crearEm({ mockPersonaje: null });
    expect(await serviceNull.obtenerPorId(999)).toBeNull();
  });

  it('crearPersonaje crea exitosamente un personaje con su inventario inicial', async () => {
    const { service, em } = crearEm();
    const nuevo = await service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 20,
    });

    expect(nuevo.idPersonaje).toBe(99);
    expect(em.create).toHaveBeenCalledWith(Personaje, expect.objectContaining({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      nivel: 1,
      xp: 0,
      dinero: 100,
      clase,
      jugador,
      partida,
    }));
    expect(em.create).toHaveBeenCalledWith(Inventario, expect.objectContaining({
      numInventario: 1,
      cantidadEspacio: 10,
    }));
  });

  it('crearPersonaje falla si la clase no existe', async () => {
    const { service } = crearEm({ mockClase: null });
    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 999,
      idUsuarioJugador: 10,
      idPartida: 20,
    })).rejects.toThrow(ErrorReferenciaNoEncontrada);
  });

  it('crearPersonaje falla si el jugador no existe', async () => {
    const { service } = crearEm({ mockJugador: null });
    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 999,
      idPartida: 20,
    })).rejects.toThrow(ErrorReferenciaNoEncontrada);
  });

  it('crearPersonaje falla si la partida está finalizada', async () => {
    const partidaInactiva = Object.assign(new Partida(), { ...partida, estado: false });
    const { service } = crearEm({ mockPartida: partidaInactiva });

    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 20,
    })).rejects.toThrow('La partida está finalizada');
  });

  it('crearPersonaje falla si el jugador está inactivo', async () => {
    const jugadorInactivo = Object.assign(new Jugador(), { ...jugador, estado: false });
    const { service } = crearEm({ mockJugador: jugadorInactivo });

    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 20,
    })).rejects.toThrow('El jugador está inactivo');
  });

  it('crearPersonaje valida contraseña de partida privada y rechaza si es errónea', async () => {
    const partidaPrivada = Object.assign(new Partida(), { ...partida, contrasena: 'hash_secreto' });
    vi.spyOn(passwordSecurity, 'verifyPassword').mockResolvedValue(false);

    const { service } = crearEm({ mockPartida: partidaPrivada });

    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 20,
      contrasenaPartida: 'incorrecta',
    })).rejects.toThrow('Contraseña de partida incorrecta');
  });

  it('crearPersonaje rechaza si la partida no tiene cupos disponibles', async () => {
    const { service } = crearEm({ countPartidaPersonajes: 4 });

    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 20,
    })).rejects.toThrow('La partida no tiene cupos disponibles');
  });

  it('crearPersonaje rechaza si el jugador ya tiene un personaje en la partida', async () => {
    const { service } = crearEm({ countJugadorPartidaPersonajes: 1 });

    await expect(service.crearPersonaje({
      nombreFicticio: 'Legolas',
      raza: 'Elfo',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 20,
    })).rejects.toThrow('Ya tenés un personaje en esta partida');
  });

  it('actualizarPersonaje modifica campos permitidos', async () => {
    const { service } = crearEm();
    const modificado = await service.actualizarPersonaje(100, {
      nombreFicticio: 'Thorin II',
      raza: 'Enano Noble',
    });

    expect(modificado?.nombreFicticio).toBe('Thorin II');
    expect(modificado?.raza).toBe('Enano Noble');
  });

  it('eliminarPersonaje rechaza si tiene historial de sesiones', async () => {
    const { service } = crearEm({ countSesiones: 2 });
    await expect(service.eliminarPersonaje(100))
      .rejects.toThrow('No se puede borrar un personaje con historial de sesiones');
  });

  it('eliminarPersonaje rechaza si tiene objetos en su inventario', async () => {
    const { service } = crearEm({ countObjetos: 3 });
    await expect(service.eliminarPersonaje(100))
      .rejects.toThrow('Vendé los objetos antes de borrar el personaje');
  });

  it('eliminarPersonaje elimina el personaje y sus inventarios exitosamente', async () => {
    const { service, em } = crearEm();
    const eliminado = await service.eliminarPersonaje(100);
    expect(eliminado).toBe(true);
    expect(em.removeAndFlush).toHaveBeenCalledWith(personaje);
  });
});
