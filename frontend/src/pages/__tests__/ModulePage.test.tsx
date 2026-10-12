import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import ModulePage from '../ModulePage';
const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('../../services/api', () => ({ api: mocks.api }));
vi.mock('../../context/UserContext', () => ({ useUser: () => ({ usuarioLogueado: { idUsuario: 1 }, rolDe: () => 'anfitrion' }) }));
beforeEach(() => {
  mocks.api.mockReset();
  mocks.api.mockImplementation(async (path: string, method = 'GET') => {
    if (method !== 'GET') return {};
    if (path === '/partidas') return [{ idPartida: 1, nombre: 'Campaña', idUsuarioAnfitrion: 1, nicknameAnfitrion: 'host', estado: 'activa', esPrivada: false, limiteJugadores: 4 }];
    if (path === '/clases') return [{ idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Combate' }];
    if (path === '/misiones') return [{ idPartida: 1, numSesion: 2, numMision: 3, descripcion: 'Rescate', xpTotal: 20, dineroTotal: 10, asistenciaGrupoGrande: 0, estado: false }];
    return [];
  });
});
it.each([['clases', 'Clases'], ['tiendas', 'Tiendas'], ['partidas', 'Partidas'], ['personajes', 'Personajes'], ['inventarios', 'Inventarios']] as const)('carga módulo %s desde API', async (resource, title) => {
  render(<ModulePage resource={resource} />);
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(mocks.api).toHaveBeenCalledWith(`/${resource}`);
});
it('guarda partida propia sin enviar contraseña para una partida pública', async () => {
  render(<ModulePage resource="partidas" />);
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/partidas', 'POST', { nombre: 'Nueva', estado: 'activa', limiteJugadores: 4, esPrivada: false, idUsuarioAnfitrion: 1 }));
});

it('filtra partidas por idPartida numérico sin confundirse con otros campos numéricos', async () => {
  mocks.api.mockImplementation(async (path: string, method = 'GET') => {
    if (method !== 'GET') return {};
    if (path === '/partidas') {
      return [
        { idPartida: 1, nombre: 'Campaña de prueba', idUsuarioAnfitrion: 1, nicknameAnfitrion: 'dm_demo', estado: 'activa', esPrivada: false, limiteJugadores: 4 },
        { idPartida: 4, nombre: 'Aventura Especial', idUsuarioAnfitrion: 2, nicknameAnfitrion: 'franco', estado: 'activa', esPrivada: false, limiteJugadores: 1 },
      ];
    }
    return [];
  });

  render(<ModulePage resource="partidas" />);
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

  expect(screen.getByText('Campaña de prueba')).toBeInTheDocument();
  expect(screen.getByText('Aventura Especial')).toBeInTheDocument();

  // Buscar '1': debe mostrar solo la partida 1, NO la partida 4 (aunque tenga limiteJugadores: 1)
  const inputBuscar = screen.getByPlaceholderText('Buscar por Id de Partida');
  fireEvent.change(inputBuscar, { target: { value: '1' } });

  expect(screen.getByText('Campaña de prueba')).toBeInTheDocument();
  expect(screen.queryByText('Aventura Especial')).not.toBeInTheDocument();

  // Buscar '4': debe mostrar solo la partida 4, NO la partida 1 (aunque tenga limiteJugadores: 4)
  fireEvent.change(inputBuscar, { target: { value: '4' } });

  expect(screen.queryByText('Campaña de prueba')).not.toBeInTheDocument();
  expect(screen.getByText('Aventura Especial')).toBeInTheDocument();
});

it('muestra el encabezado de nickname del anfitrión formateado y separado', async () => {
  render(<ModulePage resource="partidas" />);
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  expect(screen.getByText('Nickname Anfitrión')).toBeInTheDocument();
});

