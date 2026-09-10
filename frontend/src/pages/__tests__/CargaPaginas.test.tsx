import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ClasesPage from '../ClasesPage';
import TiendasPage from '../TiendasPage';
import PersonajesPage from '../PersonajesPage';

const mocks = vi.hoisted(() => ({ api: vi.fn(), jugadores: [{ idUsuario: 1, estado: true }] }));
vi.mock('../../services/api', () => ({ api: mocks.api }));
vi.mock('../../context/UserContext', () => ({ useUser: () => ({ usuarioLogueado: { idUsuario: 1 }, jugadores: mocks.jugadores, rolDe: () => 'anfitrion' }) }));
beforeEach(() => { mocks.api.mockReset(); mocks.api.mockResolvedValue([]); mocks.jugadores = [{ idUsuario: 1, estado: true }]; });
afterEach(cleanup);

it.each([ClasesPage, TiendasPage, PersonajesPage])('recupera la carga de %s después de un fallo de red', async Page => {
  let failed = true;
  mocks.api.mockImplementation(async () => {
    if (failed) throw new Error('Sin conexión');
    return [];
  });
  render(<Page />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
  failed = false;
  const previousCalls = mocks.api.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(mocks.api.mock.calls.length).toBeGreaterThan(previousCalls));
  await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

it('permite crear un personaje a una cuenta con ambos perfiles', async () => {
  render(<PersonajesPage />);
  fireEvent.click(screen.getByRole('button', { name: /Crear Personaje/ }));
  expect(screen.getByRole('heading', { name: 'Crear Nuevo Personaje' })).toBeInTheDocument();
  await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/personajes'));
});

it('no ofrece crear personajes a una cuenta que solo es anfitriona', async () => {
  mocks.jugadores = [];
  render(<PersonajesPage />);
  await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/personajes'));
  expect(screen.queryByRole('button', { name: /Crear Personaje/ })).not.toBeInTheDocument();
});
