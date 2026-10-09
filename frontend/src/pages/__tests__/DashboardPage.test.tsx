import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../DashboardPage';

const mocks = vi.hoisted(() => ({
  usuarioLogueado: { idUsuario: 1, nickname: 'Gandalf' } as null | { idUsuario: number; nickname: string },
  usuarios: [
    { idUsuario: 1, nickname: 'Gandalf', nombreUsuario: 'Mago Blanco' },
    { idUsuario: 2, nickname: 'Aragorn', nombreUsuario: 'Montaraz' },
  ],
  jugadores: [{ idUsuario: 2 }],
  anfitriones: [{ idUsuario: 1 }],
  rolDe: (id: number) => (id === 1 ? 'anfitrion' : 'jugador'),
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: mocks.usuarioLogueado,
    usuarios: mocks.usuarios,
    jugadores: mocks.jugadores,
    anfitriones: mocks.anfitriones,
    rolDe: mocks.rolDe,
  }),
}));

describe('DashboardPage', () => {
  it('no renderiza nada si no hay usuario logueado', () => {
    mocks.usuarioLogueado = null;
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza la cabecera, métricas y directorio con usuario autenticado', () => {
    mocks.usuarioLogueado = { idUsuario: 1, nickname: 'Gandalf' };
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Centro de Mando/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gandalf' })).toBeInTheDocument();
    expect(screen.getByText(/👑 Anfitrión/i)).toBeInTheDocument();
    expect(screen.getByText(/Acciones Rápidas/i)).toBeInTheDocument();
    expect(screen.getByText(/Directorio de Aventureros/i)).toBeInTheDocument();
    expect(screen.getByText('Aragorn')).toBeInTheDocument();
  });
});
