// Pruebas del circuito de cuentas (registro, login, sesión y logout) sin MySQL:
// se monta el router real de autenticación sobre un EntityManager simulado.
import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { EntityManager, UniqueConstraintViolationException } from '@mikro-orm/core';
import { createAuth } from '../security/auth';
import { manejarErrores } from '../app';
import { Usuario } from '../entities/Usuario.entity';
import { Jugador } from '../entities/Jugador.entity';
import { hashPassword } from '../security/password';

type Fila = Record<string, unknown>;

function emSimulado(opciones: { fallaFlush?: boolean } = {}) {
  const usuarios: Fila[] = [];
  const jugadores: Fila[] = [];
  const anfitriones: Fila[] = [];
  const tablas = new Map<unknown, Fila[]>([[Usuario, usuarios], [Jugador, jugadores]]);
  let proximoId = 1;
  const buscar = (entidad: unknown, condicion: Fila) => {
    const filas = tablas.get(entidad) ?? anfitriones;
    return filas.find(fila => Object.entries(condicion).every(([campo, valor]) => {
      if (campo === 'usuario') return (fila.usuario as Fila)?.idUsuario === (valor as Fila).idUsuario;
      return fila[campo] === valor;
    })) ?? null;
  };
  const pendientes: Array<[unknown, Fila]> = [];
  const tx = {
    create: (entidad: unknown, datos: Fila) => {
      const fila = { ...datos, ...(entidad === Usuario ? { idUsuario: proximoId++ } : {}) };
      pendientes.push([entidad, fila]);
      return fila;
    },
    flush: async () => {
      if (opciones.fallaFlush) throw new UniqueConstraintViolationException(new Error('Duplicate entry'));
      for (const [entidad, fila] of pendientes.splice(0)) (tablas.get(entidad) ?? anfitriones).push(fila);
    },
  };
  const em = {
    findOne: async (entidad: unknown, condicion: Fila) => buscar(entidad, condicion),
    findOneOrFail: async (entidad: unknown, condicion: Fila) => buscar(entidad, condicion),
    transactional: async (accion: (tx: unknown) => Promise<unknown>) => accion(tx),
  } as unknown as EntityManager;
  return { em, usuarios };
}

let servidor: Server | undefined;

function levantar(em: EntityManager) {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', createAuth(em).router);
  app.use(manejarErrores);
  servidor = app.listen(0);
  const { port } = servidor.address() as AddressInfo;
  return `http://127.0.0.1:${port}/api/auth`;
}

const pedir = (base: string, ruta: string, cuerpo?: unknown, cookie?: string) => fetch(`${base}${ruta}`, {
  method: cuerpo === undefined ? 'GET' : 'POST',
  headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
  ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }),
});

const cuerpoDe = async (respuesta: Response) => await respuesta.json() as { message?: string; usuario?: { nickname: string } };

const cuenta = { nombreUsuario: 'Emanuel Salomón', nickname: 'emasalomon', contrasena: 'PruebaSegura123', tipo: 'jugador' };

afterEach(() => { servidor?.close(); servidor = undefined; });

describe('cuentas y sesión', () => {
  it('registra una cuenta sin devolver la contraseña y guarda el hash', async () => {
    const { em, usuarios } = emSimulado();
    const base = levantar(em);

    const respuesta = await pedir(base, '/register', cuenta);

    expect(respuesta.status).toBe(201);
    const cuerpo = await respuesta.json();
    expect(cuerpo).toEqual({ idUsuario: 1, nombreUsuario: 'Emanuel Salomón', nickname: 'emasalomon', imagen: '' });
    expect(cuerpo).not.toHaveProperty('contrasena');
    expect(usuarios[0].contrasena).not.toBe('PruebaSegura123');
    expect(String(usuarios[0].contrasena)).toMatch(/^s\$[a-f0-9]{32}\$[a-f0-9]{64}$/);
  });

  it('explica que el nickname está repetido en vez de dar un error genérico', async () => {
    const { em } = emSimulado();
    const base = levantar(em);
    await pedir(base, '/register', cuenta);

    const repetido = await pedir(base, '/register', { ...cuenta, nombreUsuario: 'Otra persona' });

    expect(repetido.status).toBe(409);
    expect((await cuerpoDe(repetido)).message).toMatch(/nickname ya está en uso/);
  });

  it('también avisa si la restricción única salta durante el guardado', async () => {
    const { em } = emSimulado({ fallaFlush: true });
    const base = levantar(em);

    const respuesta = await pedir(base, '/register', cuenta);

    expect(respuesta.status).toBe(409);
    expect((await cuerpoDe(respuesta)).message).toMatch(/nickname ya está en uso/);
  });

  it('rechaza contraseñas cortas con el detalle del campo', async () => {
    const { em } = emSimulado();
    const base = levantar(em);

    const respuesta = await pedir(base, '/register', { ...cuenta, contrasena: '123' });

    expect(respuesta.status).toBe(400);
    expect((await cuerpoDe(respuesta)).message).toContain('contrasena');
  });

  it('inicia sesión, recupera la sesión con la cookie y la cierra', async () => {
    const { em, usuarios } = emSimulado();
    usuarios.push({ idUsuario: 7, nombreUsuario: 'Emanuel', nickname: 'ema', imagen: '', contrasena: await hashPassword('PruebaSegura123') });
    const base = levantar(em);

    const login = await pedir(base, '/login', { nickname: 'ema', contrasena: 'PruebaSegura123' });
    expect(login.status).toBe(200);
    expect(await login.json()).toEqual({
      usuario: { idUsuario: 7, nombreUsuario: 'Emanuel', nickname: 'ema', imagen: '' },
      roles: { idUsuario: 7, anfitrion: false, jugador: false },
    });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    expect(cookie).toMatch(/^rpg_session=/);
    expect(login.headers.get('set-cookie')).toContain('HttpOnly');

    const yo = await pedir(base, '/me', undefined, cookie);
    expect(yo.status).toBe(200);
    expect((await cuerpoDe(yo)).usuario!.nickname).toBe('ema');

    expect((await pedir(base, '/logout', {}, cookie)).status).toBe(204);
    expect((await pedir(base, '/me', undefined, cookie)).status).toBe(401);
  });

  it('da el mismo mensaje para nickname inexistente y contraseña incorrecta', async () => {
    const { em, usuarios } = emSimulado();
    usuarios.push({ idUsuario: 7, nombreUsuario: 'Emanuel', nickname: 'ema', imagen: '', contrasena: await hashPassword('PruebaSegura123') });
    const base = levantar(em);

    const malaClave = await pedir(base, '/login', { nickname: 'ema', contrasena: 'otraClave' });
    const inexistente = await pedir(base, '/login', { nickname: 'nadie', contrasena: 'PruebaSegura123' });

    expect(malaClave.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect((await cuerpoDe(malaClave)).message).toBe('Usuario o contraseña incorrecta');
    expect((await cuerpoDe(inexistente)).message).toBe('Usuario o contraseña incorrecta');
  });

  it('sin cookie válida no hay sesión que recuperar', async () => {
    const { em } = emSimulado();
    const base = levantar(em);

    expect((await pedir(base, '/me')).status).toBe(401);
    expect((await pedir(base, '/me', undefined, 'rpg_session=inventado')).status).toBe(401);
  });
});
