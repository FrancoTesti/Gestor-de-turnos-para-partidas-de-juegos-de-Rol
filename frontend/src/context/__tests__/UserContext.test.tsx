import { act, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { UserProvider, useUser } from '../UserContext';
import { api } from '../../services/api';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
function Account() {
  const { usuarioLogueado, usuarios, jugadores, anfitriones } = useUser();
  return <p>{usuarioLogueado?.nickname ?? 'Sin sesión'} / {usuarios.length}:{jugadores.length}:{anfitriones.length}</p>;
}

it('un rechazo real de la API limpia identidad y listas privadas del contexto', async () => {
  const user = { idUsuario: 1, nickname: 'renzo', nombreUsuario: 'Renzo', imagen: '' };
  let expired = false;
  vi.stubGlobal('fetch', vi.fn(async (path: string) => {
    if (expired) return new Response('{"message":"Sesión expirada"}', { status: 401 });
    const body = path === '/api/auth/me' ? { usuario: user, roles: { idUsuario: 1, jugador: true, anfitrion: true } }
      : path === '/api/usuarios' ? [user] : [{ idUsuario: 1 }];
    return new Response(JSON.stringify(body));
  }));
  render(<UserProvider><Account /></UserProvider>);
  await waitFor(() => expect(screen.getByText('renzo / 1:1:1')).toBeInTheDocument());
  expired = true;
  await act(async () => { await expect(api('/sesiones')).rejects.toMatchObject({ status: 401 }); });
  expect(screen.getByText('Sin sesión / 0:0:0')).toBeInTheDocument();
});
