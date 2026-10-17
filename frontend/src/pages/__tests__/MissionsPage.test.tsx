import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MisionesPage } from '../MissionsPage';
import * as misionService from '../../services/mission.service';
import * as apiModule from '../../services/api';
import * as userContextModule from '../../context/UserContext';

vi.mock('../../services/mission.service');
vi.mock('../../services/api');
vi.mock('../../services/session.service');
vi.mock('../../context/UserContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useUser: vi.fn(),
  };
});

const mockHostUser = {
  usuarioLogueado: { idUsuario: 1, nickname: 'Anfitrion' },
  rolDe: () => 'anfitrion',
  login: vi.fn(),
  logout: vi.fn(),
  verificarRol: vi.fn()
};

describe('MisionesPage - Interfaz y Validaciones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userContextModule.useUser).mockReturnValue(mockHostUser as any);
    const mockMisionesData = [
      { idPartida: 1, numSesion: 1, numMision: 1, dineroTotal: 100, xpTotal: 50, estado: false }
    ];
    if (misionService.obtenerMisiones) (misionService.obtenerMisiones as any).mockResolvedValue(mockMisionesData);
    if (misionService.getMissions) (misionService.getMissions as any).mockResolvedValue(mockMisionesData);
    (apiModule.api as any).mockResolvedValue([]);
  });

  it('renderiza la misión pendiente y muestra los totales', async () => {
    render(<MisionesPage />);
    await waitFor(() => expect(screen.getByText('Gestión de Misiones')).toBeInTheDocument());
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Repartir/i })).toBeInTheDocument();
  });

  it('muestra cartel de advertencia en español abajo al intentar crear misión sin seleccionar sesión', async () => {
    const { fireEvent } = await import('@testing-library/react');
    render(<MisionesPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Crear Misión' })).toBeInTheDocument());

    const inputNumMision = screen.getByLabelText(/Número Misión:/i);
    fireEvent.change(inputNumMision, { target: { value: '3' } });

    const inputDesc = screen.getByLabelText(/Descripción:/i);
    fireEvent.change(inputDesc, { target: { value: 'Misión de prueba' } });

    const form = screen.getByRole('heading', { name: 'Crear Misión' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText(/Debes seleccionar una sesión en curso para crear la misión/i)[0]).toBeInTheDocument();
    });

    if (misionService.crearMision) expect(misionService.crearMision).not.toHaveBeenCalled();
    if (misionService.createMission) expect(misionService.createMission).not.toHaveBeenCalled();
  });

  it('traduce el error de Too small del backend y lo muestra en el cartel de advertencia de Crear Misión', async () => {
    (apiModule.api as any).mockImplementation((path: string) => {
      if (path === '/sesiones') {
        return Promise.resolve([{ idPartida: 1, numSesion: 1, estadoSesion: 1, duracionSesion: 60, cantJugadores: 2 }]);
      }
      if (path === '/partidas') {
        return Promise.resolve([{ idPartida: 1, nombre: 'Partida Alfa', idUsuarioAnfitrion: 1 }]);
      }
      return Promise.resolve([]);
    });
    const errRejection = new Error('idPartida: Too small: expected number to be >0; numSesion: Too small: expected number to be >0');
    if (misionService.crearMision) (misionService.crearMision as any).mockRejectedValue(errRejection);
    if (misionService.createMission) (misionService.createMission as any).mockRejectedValue(errRejection);

    const { fireEvent } = await import('@testing-library/react');
    render(<MisionesPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Crear Misión' })).toBeInTheDocument());

    const selectSesion = screen.getByLabelText(/Sesión en Curso:/i);
    fireEvent.change(selectSesion, { target: { value: '1-1' } });

    const inputNumMision = screen.getByLabelText(/Número Misión:/i);
    fireEvent.change(inputNumMision, { target: { value: '1' } });

    const inputDesc = screen.getByLabelText(/Descripción:/i);
    fireEvent.change(inputDesc, { target: { value: 'Misión con error' } });

    const form = screen.getByRole('heading', { name: 'Crear Misión' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText(/Debes seleccionar una sesión en curso para crear la misión/i)[0]).toBeInTheDocument();
    });
  });
});

