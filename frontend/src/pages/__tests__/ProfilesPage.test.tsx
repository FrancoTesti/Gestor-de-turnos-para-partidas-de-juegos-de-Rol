import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfilesPage from '../ProfilesPage';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  reload: vi.fn(),
  state: {
    usuarioLogueado: { idUsuario: 1, nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '' },
    jugadores: [{ idUsuario: 1, estado: true, nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '' }],
    anfitriones: [] as Array<Record<string, unknown>>,
  },
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({ ...mocks.state, recargar: mocks.reload }),
}));
vi.mock('../../services/api', () => ({ api: mocks.api }));

describe('ProfilesPage', () => {
  beforeEach(() => {
    mocks.api.mockReset();
    mocks.reload.mockReset();
    mocks.api.mockResolvedValue(undefined);
    mocks.reload.mockResolvedValue(undefined);
    mocks.state.jugadores = [{ idUsuario: 1, estado: true, nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '' }];
    mocks.state.anfitriones = [];
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('actualiza el perfil de jugador y permite crear el perfil de anfitrión propio', async () => {
    render(<ProfilesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/jugadores/1', 'PUT', { estado: false }));
    await waitFor(() => expect(mocks.reload).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Crear perfil de anfitrión' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/anfitriones', 'POST', { idUsuario: 1 }));
  });

  it('muestra el error del servidor cuando un perfil tiene datos relacionados', async () => {
    mocks.api.mockRejectedValueOnce(new Error('El registro tiene datos relacionados. Resolvé esas relaciones antes de eliminarlo.'));
    render(<ProfilesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar perfil' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('datos relacionados');
    expect(mocks.reload).not.toHaveBeenCalled();
  });
});
