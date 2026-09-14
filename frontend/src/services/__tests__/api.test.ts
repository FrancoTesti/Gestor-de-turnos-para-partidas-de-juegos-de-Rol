import { afterEach, expect, it, vi } from 'vitest';
import { api, SESSION_EXPIRED_EVENT } from '../api';

afterEach(() => vi.unstubAllGlobals());

it('envía cookies y JSON al mismo origen y admite DELETE sin cuerpo', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
  await expect(api('/usuarios/1', 'DELETE')).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith('/api/usuarios/1', { method: 'DELETE', credentials: 'same-origin' });
  await api('/clases', 'POST', { nombreClase: 'Mago' });
  expect(fetchMock).toHaveBeenLastCalledWith('/api/clases', expect.objectContaining({ credentials: 'same-origin', body: '{"nombreClase":"Mago"}' }));
});

it('expira la sesión ante 401 protegido, pero no por contraseña incorrecta', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => new Response('{"message":"No autorizado"}', { status: 401 })));
  const listener = vi.fn();
  window.addEventListener(SESSION_EXPIRED_EVENT, listener);
  try {
    await expect(api('/auth/login', 'POST', {})).rejects.toMatchObject({ status: 401 });
    expect(listener).not.toHaveBeenCalled();
    await expect(api('/sesiones')).rejects.toMatchObject({ status: 401 });
    expect(listener).toHaveBeenCalledTimes(1);
  } finally { window.removeEventListener(SESSION_EXPIRED_EVENT, listener); }
});

it('conserva el error HTTP aunque el servidor entregue errores con otro formato', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"errors":"fallo","message":"Sin permiso"}', { status: 403 })));
  await expect(api('/clases')).rejects.toMatchObject({ status: 403, message: 'Sin permiso' });
});

it('explica fallos de conexión sin reintentar una escritura', async () => {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
  vi.stubGlobal('fetch', fetchMock);
  await expect(api('/objetos/1/comprar', 'POST', {})).rejects.toMatchObject({ status: 0, message: expect.stringContaining('conectar') });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
