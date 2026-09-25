// Errores que ocurren al leer el cuerpo, antes de llegar a cualquier router: se prueban sobre
// createApp real para cubrir también el límite configurado en express.json.
import { afterEach, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { MikroORM } from '@mikro-orm/mysql';
import { createApp, mensajeCuerpoGrande } from '../app';

let servidor: Server | undefined;

function levantar() {
  // El cuerpo se rechaza antes de abrir el contexto de MikroORM, así que no hace falta una base.
  const orm = { em: {} } as unknown as MikroORM;
  servidor = createApp(orm).listen(0);
  const { port } = servidor.address() as AddressInfo;
  return `http://127.0.0.1:${port}/api`;
}

const enviar = (base: string, cuerpo: string) => fetch(`${base}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: cuerpo,
});

afterEach(() => { servidor?.close(); servidor = undefined; });

describe('errores al leer el cuerpo', () => {
  it('responde 413 con un mensaje claro cuando el cuerpo supera los 64 KB', async () => {
    const base = levantar();
    const cuerpo = JSON.stringify({ nickname: 'dm_demo', contrasena: 'x'.repeat(65 * 1024) });

    const respuesta = await enviar(base, cuerpo);

    expect(respuesta.status).toBe(413);
    expect(await respuesta.json()).toEqual({ message: mensajeCuerpoGrande });
  });

  it('sigue respondiendo 400 ante JSON mal formado', async () => {
    const base = levantar();

    const respuesta = await enviar(base, '{"nickname":');

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ message: 'JSON inválido' });
  });
});
