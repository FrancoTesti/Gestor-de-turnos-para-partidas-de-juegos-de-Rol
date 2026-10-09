import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainLayout from '../MainLayout';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  usuario: { idUsuario: 1, nickname: 'Gamer1' } as any,
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: mocks.usuario,
    logout: mocks.logout,
    mensaje: null,
    limpiarMensaje: vi.fn(),
    cargandoSesion: false,
  }),
}));

describe('MainLayout', () => {
  beforeEach(() => {
    mocks.logout.mockReset();
    mocks.logout.mockResolvedValue(undefined);
  });

  it('renderiza la barra de navegación y greeting de usuario', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Gestor de Rol')).toBeInTheDocument();
    expect(screen.getByText('Hola, Gamer1')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('despliega menú interactivo al hacer clic en pestañas del header', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const menuJuego = screen.getByText('Juego ▾');
    fireEvent.click(menuJuego);

    expect(screen.getByRole('link', { name: 'Partidas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sesiones' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Misiones' })).toBeInTheDocument();
  });

  it('abre modal de confirmación al presionar Cerrar Sesión', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));

    const modalContent = screen.getByText('¿Estás seguro de que deseas cerrar sesión?').closest('.modal-content')!;
    const confirmBtn = within(modalContent as HTMLElement).getByRole('button', { name: 'Cerrar Sesión' });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mocks.logout).toHaveBeenCalled());
  });

  it('despliega menú interactivo, permite navegar con teclado y cierra al seleccionar una opción', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
            <Route path="profiles" element={<div>Profiles Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const triggerSistema = screen.getByRole('button', { name: /Sistema/i });
    expect(triggerSistema).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(triggerSistema, { key: 'Enter' });
    expect(triggerSistema).toHaveAttribute('aria-expanded', 'true');

    const linkConfig = screen.getByRole('link', { name: 'Configuración' });
    expect(linkConfig).toBeInTheDocument();

    fireEvent.click(linkConfig);
    expect(triggerSistema).toHaveAttribute('aria-expanded', 'false');

    // Cerrar con Escape
    fireEvent.click(triggerSistema);
    expect(triggerSistema).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(triggerSistema).toHaveAttribute('aria-expanded', 'false');
  });
});
