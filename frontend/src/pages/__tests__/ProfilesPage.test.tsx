import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProfilesPage from '../ProfilesPage';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  reload: vi.fn(),
  logout: vi.fn(),
  state: {
    usuarioLogueado: { idUsuario: 1, nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '' },
    jugadores: [{ idUsuario: 1, estado: true, nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '' }],
    anfitriones: [] as Array<Record<string, unknown>>,
  },
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({ ...mocks.state, recargar: mocks.reload, logout: mocks.logout }),
}));
vi.mock('../../services/api', () => ({ api: mocks.api }));

describe('ProfilesPage', () => {
  beforeEach(() => {
    mocks.api.mockReset();
    mocks.reload.mockReset();
    mocks.logout.mockReset();
    mocks.api.mockResolvedValue(undefined);
    mocks.reload.mockResolvedValue(undefined);
    mocks.logout.mockResolvedValue(undefined);
    mocks.state.jugadores = [{ idUsuario: 1, estado: true, nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '' }];
    mocks.state.anfitriones = [];
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('muestra los datos de la cuenta propia', () => {
    render(<ProfilesPage />);

    expect(screen.getByText('Renzo')).toBeInTheDocument();
    expect(screen.getByText('@renzo')).toBeInTheDocument();
    expect(screen.getByText('Estado: Activo')).toBeInTheDocument();
    expect(screen.getByText('Todavía no tenés perfil de anfitrión.')).toBeInTheDocument();
  });

  it('actualiza el perfil de jugador y permite crear el perfil de anfitrión propio', async () => {
    render(<ProfilesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar estado' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/jugadores/1', 'PUT', { estado: false }));
    await waitFor(() => expect(mocks.reload).toHaveBeenCalled());
    expect(await screen.findByRole('status')).toHaveTextContent('inactivo');

    fireEvent.click(screen.getByRole('button', { name: 'Crear perfil de anfitrión' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/anfitriones', 'POST', { idUsuario: 1 }));
  });

  it('muestra el karma y las partidas calculadas por el servidor', () => {
    mocks.state.anfitriones = [{ idUsuario: 1, karma: 1, cantPartidasActuales: 1 }];
    render(<ProfilesPage />);

    expect(screen.getByText('Karma: 1. Partidas activas: 1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Crear perfil de anfitrión' })).not.toBeInTheDocument();
  });

  it('muestra el error del servidor cuando un perfil tiene datos relacionados', async () => {
    mocks.api.mockRejectedValueOnce(new Error('El registro tiene datos relacionados. Resolvé esas relaciones antes de eliminarlo.'));
    render(<ProfilesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar perfil de jugador' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('datos relacionados');
    expect(mocks.reload).not.toHaveBeenCalled();
  });

  it('edita los datos propios sin enviar el identificador', async () => {
    render(<ProfilesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar mis datos' }));
    fireEvent.change(screen.getByLabelText(/Nickname/), { target: { value: 'renzo2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/usuarios/1', 'PUT', {
      nombreUsuario: 'Renzo', nickname: 'renzo2', imagen: '',
    }));
    expect(mocks.logout).not.toHaveBeenCalled();
  });

  it('cierra la sesión cuando se cambia la contraseña', async () => {
    render(<ProfilesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar mis datos' }));
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'nuevaclave' } });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/usuarios/1', 'PUT', {
      nombreUsuario: 'Renzo', nickname: 'renzo', imagen: '', contrasena: 'nuevaclave',
    }));
    await waitFor(() => expect(mocks.logout).toHaveBeenCalled());
  });

  it('informa cuando la cuenta no tiene perfil de jugador', () => {
    mocks.state.jugadores = [];
    render(<ProfilesPage />);

    expect(screen.getByText('Todavía no tenés perfil de jugador.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear perfil de jugador' })).toBeInTheDocument();
  });
});
