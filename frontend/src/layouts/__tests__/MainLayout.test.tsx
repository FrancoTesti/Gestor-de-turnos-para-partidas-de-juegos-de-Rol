import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainLayout from '../MainLayout';

const mocks = vi.hoisted(() => ({
  usuarioLogueado: { idUsuario: 1, nickname: 'Gandalf' } as null | { idUsuario: number; nickname: string },
  cargandoSesion: false,
  mensaje: null as string | null,
  logout: vi.fn(),
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
  beforeEach(() => {
    mocks.usuarioLogueado = { idUsuario: 1, nickname: 'Gandalf' };
    mocks.cargandoSesion = false;
    mocks.logout.mockReset();
    mocks.logout.mockResolvedValue(undefined);
  });

  it('muestra estado de carga mientras se recupera la sesión', () => {
    mocks.cargandoSesion = true;
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>
    );
    expect(screen.getByText(/Recuperando sesión…/i)).toBeInTheDocument();
  });

  it('renderiza la barra de navegación, saludo de usuario y contenido de ruta', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Gestor de Rol')).toBeInTheDocument();
    expect(screen.getByText(/Hola, Gandalf/i)).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('despliega menú interactivo, permite navegar con teclado y cierra al seleccionar una opción', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="*" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const menuJuego = screen.getByText('Juego ▾');
    expect(menuJuego).toHaveAttribute('aria-expanded', 'false');

    // Desplegar menú con click
    fireEvent.click(menuJuego);
    expect(menuJuego).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Partidas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sesiones' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Misiones' })).toBeInTheDocument();

    // Cerrar con Escape
    fireEvent.keyDown(menuJuego, { key: 'Escape' });
    expect(menuJuego).toHaveAttribute('aria-expanded', 'false');

    // Abrir con Enter
    fireEvent.keyDown(menuJuego, { key: 'Enter' });
    expect(menuJuego).toHaveAttribute('aria-expanded', 'true');

    // Cerrar al hacer clic en un enlace del menú
    const linkPartidas = screen.getByRole('link', { name: 'Partidas' });
    fireEvent.click(linkPartidas);
    expect(menuJuego).toHaveAttribute('aria-expanded', 'false');

    // Desplegar menú Sistema y verificar enlace a Configuración
    const menuSistema = screen.getByText('Sistema ▾');
    fireEvent.click(menuSistema);
    expect(menuSistema).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Configuración' })).toBeInTheDocument();

    // Cerrar al hacer clic fuera
    fireEvent.mouseDown(document.body);
    expect(menuSistema).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre modal de confirmación al presionar Cerrar Sesión y ejecuta logout al confirmar', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="login" element={<div>Página Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));

    const modalContent = screen.getByText('¿Estás seguro de que deseas cerrar sesión?').closest('.modal-content')!;
    const confirmBtn = within(modalContent as HTMLElement).getByRole('button', { name: 'Cerrar Sesión' });
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(mocks.logout).toHaveBeenCalled());
  });
});
