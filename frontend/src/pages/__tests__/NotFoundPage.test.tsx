import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import NotFoundPage from '../NotFoundPage';

const mocks = vi.hoisted(() => ({ usuarioLogueado: null as null | { idUsuario: number; nickname: string } }));
vi.mock('../../context/UserContext', () => ({ useUser: () => ({ usuarioLogueado: mocks.usuarioLogueado }) }));

afterEach(() => { cleanup(); mocks.usuarioLogueado = null; });

function renderizar(ruta: string) {
  return render(<MemoryRouter initialEntries={[ruta]}><NotFoundPage /></MemoryRouter>);
}

it('informa la ruta inexistente y ofrece volver al dashboard a un usuario con sesión', () => {
  mocks.usuarioLogueado = { idUsuario: 1, nickname: 'renzo' };
  renderizar('/seccion-inexistente');

  expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('/seccion-inexistente');
  expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toHaveAttribute('href', '/dashboard');
});

it('ofrece ir al inicio de sesión cuando no hay usuario autenticado', () => {
  renderizar('/otra-ruta-invalida');

  expect(screen.getByRole('alert')).toHaveTextContent('/otra-ruta-invalida');
  expect(screen.getByRole('link', { name: 'Ir al inicio de sesión' })).toHaveAttribute('href', '/login');
});
