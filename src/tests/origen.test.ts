// Defensa CSRF por encabezado Origin: se prueba sobre createApp real. La respuesta 403 sale antes de
// abrir el contexto de MikroORM, así que no hace falta una base.
import { afterEach, describe, expect, it, vi } from 'vitest';
import http, { type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { MikroORM } from '@mikro-orm/postgresql';
import { createApp } from '../app';

let servidor: Server | undefined;

async function levantar() {
  servidor = createApp({ em: {} } as unknown as MikroORM).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => servidor!.once('listening', resolve));
  return (servidor.address() as AddressInfo).port;
}

// fetch no deja controlar Origin con seguridad; http.request sí.
function postLogin(port: number, origin?: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1', port, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) },
    }, res => { res.resume(); resolve(res.statusCode ?? 0); });
    req.on('error', reject);
    req.end('{"nickname":"x","contrasena":"y"}');
  });
}

afterEach(() => { servidor?.close(); servidor = undefined; vi.restoreAllMocks(); });

describe('origen de las peticiones que modifican datos', () => {
  it('rechaza con 403 un Origin ajeno', async () => {
    const port = await levantar();
    expect(await postLogin(port, 'https://sitio-malicioso.example')).toBe(403);
  });

  it('acepta el origen propio del servidor (frontend servido por la API)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const port = await levantar();
    expect(await postLogin(port, `http://127.0.0.1:${port}`)).not.toBe(403);
  });

  it('acepta el frontend autorizado por CORS_ORIGIN (Vite en desarrollo)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const port = await levantar();
    expect(await postLogin(port, 'http://localhost:5173')).not.toBe(403);
  });

  it('no exige Origin cuando la petición no lo trae (clientes que no son navegador)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const port = await levantar();
    expect(await postLogin(port)).not.toBe(403);
  });
});
