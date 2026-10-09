import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MainLayout from '../MainLayout';

const mocks = vi.hoisted(() => ({
  usuarioLogueado: { idUsuario: 1, nickname: 'Gandalf' } as null | { idUsuario: number; nickname: string },
  cargandoSesion: false,
  mensaje: null as string | null,
  logout: vi.fn().mockResolvedValue(undefined),
  limpiarMensaje: vi.fn(),
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: mocks.usuarioLogueado,
    cargandoSesion: mocks.cargandoSesion,
    mensaje: mocks.mensaje,
    logout: mocks.logout,
    limpiarMensaje: mocks.limpiarMensaje,
  }),
}));

describe('MainLayout', () => {
  it('muestra estado de carga mientras se recupera la sesión', () => {
    mocks.cargandoSesion = true;
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(screen.getByText(/Recuperando sesión…/i)).toBeInTheDocument();
    mocks.cargandoSesion = false;
  });

  it('renderiza la barra de navegación, saludo y permite desplegar menús', () => {
    mocks.usuarioLogueado = { idUsuario: 1, nickname: 'Gandalf' };
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<div>Contenido Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Gestor de Rol')).toBeInTheDocument();
    expect(screen.getByText(/Hola, Gandalf/i)).toBeInTheDocument();
    expect(screen.getByText('Contenido Dashboard')).toBeInTheDocument();

    const menuJuego = screen.getByText('Juego ▾');
    expect(menuJuego).toHaveAttribute('aria-expanded', 'false');

    // Desplegar menú con click
    fireEvent.click(menuJuego);
    expect(menuJuego).toHaveAttribute('aria-expanded', 'true');

    // Cerrar con Escape
    fireEvent.keyDown(menuJuego, { key: 'Escape' });
    expect(menuJuego).toHaveAttribute('aria-expanded', 'false');

    // Abrir con Enter
    fireEvent.keyDown(menuJuego, { key: 'Enter' });
    expect(menuJuego).toHaveAttribute('aria-expanded', 'true');
  });

  it('permite cerrar sesión haciendo clic en el botón correspondiente', async () => {
    mocks.usuarioLogueado = { idUsuario: 1, nickname: 'Gandalf' };
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Página Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    const btnLogout = screen.getByRole('button', { name: /Cerrar Sesión/i });
    await act(async () => {
      fireEvent.click(btnLogout);
    });
    expect(mocks.logout).toHaveBeenCalled();
  });
});
