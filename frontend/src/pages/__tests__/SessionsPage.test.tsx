import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SesionesPage } from '../SessionsPage';
import * as sesionService from '../../services/session.service';
import * as apiModule from '../../services/api';
import * as userContextModule from '../../context/UserContext';

vi.mock('../../services/session.service');
vi.mock('../../services/api');
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

describe('SesionesPage - Flujo de estados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userContextModule.useUser).mockReturnValue(mockHostUser as any);
    const mockSesiones = [
      { idPartida: 1, numSesion: 1, estadoSesion: 0, duracionSesion: 60, cantJugadores: 2 }
    ];
    if (sesionService.getSessions) (sesionService.getSessions as any).mockResolvedValue(mockSesiones);
    (apiModule.api as any).mockResolvedValue([]);
  });

  it('renderiza la lista de sesiones y muestra el estado Planificada', async () => {
    render(<SesionesPage />);
    await waitFor(() => expect(screen.getByText('Gestión de Sesiones')).toBeInTheDocument());
    expect(screen.getByText('Planificada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver detalle/i })).toBeInTheDocument();
  });

  it('muestra cartel de advertencia en español abajo al crear sesión cuando el número de sesión es demasiado grande', async () => {
    (apiModule.api as any).mockImplementation((path: string) => {
      if (path === '/partidas') {
        return Promise.resolve([{ idPartida: 1, nombre: 'Campaña test', idUsuarioAnfitrion: 1 }]);
      }
      return Promise.resolve([]);
    });

    const { fireEvent } = await import('@testing-library/react');
    render(<SesionesPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Crear Sesión' })).toBeInTheDocument());

    const selectPartida = screen.getByRole('combobox');
    fireEvent.change(selectPartida, { target: { value: '1' } });

    const inputNumSesion = screen.getByLabelText(/Número Sesión:/i);
    fireEvent.change(inputNumSesion, { target: { value: '324235423542354325' } });

    const form = screen.getByRole('heading', { name: 'Crear Sesión' }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText(/El número de sesión es demasiado grande/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/2.147.483.647/i)[0]).toBeInTheDocument();
    });

    if (sesionService.createSession) expect(sesionService.createSession).not.toHaveBeenCalled();
  });

  it('traduce el error del backend y lo muestra en el cartel de advertencia de Crear Sesión', async () => {
    (apiModule.api as any).mockImplementation((path: string) => {
      if (path === '/partidas') {
        return Promise.resolve([{ idPartida: 1, nombre: 'Campaña test', idUsuarioAnfitrion: 1 }]);
      }
      return Promise.resolve([]);
    });
    const errRejection = new Error('numSesion: Too big: expected int to be <=9007199254740991; numSesion: Too big: expected number to be <=2147483647');
    if (sesionService.createSession) (sesionService.createSession as any).mockRejectedValue(errRejection);

    const { fireEvent } = await import('@testing-library/react');
    render(<SesionesPage />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Crear Sesión' })).toBeInTheDocument());

    const selectPartida = screen.getByRole('combobox');
    fireEvent.change(selectPartida, { target: { value: '1' } });

    const inputNumSesion = screen.getByLabelText(/Número Sesión:/i);
    fireEvent.change(inputNumSesion, { target: { value: '10' } });

    const btnCrear = screen.getByRole('button', { name: 'Crear Sesión' });
    fireEvent.click(btnCrear);

    await waitFor(() => {
      expect(screen.getAllByText(/El número de sesión es demasiado grande/i)[0]).toBeInTheDocument();
    });
  });
});
