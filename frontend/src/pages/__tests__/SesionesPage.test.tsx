import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SesionesPage from '../SesionesPage';
import * as sesionService from '../../services/sesion.service';
import * as apiModule from '../../services/api';
import * as userContextModule from '../../context/UserContext';

vi.mock('../../services/sesion.service');
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
    (sesionService.obtenerSesiones as any).mockResolvedValue([
      { idPartida: 1, numSesion: 1, estadoSesion: 0, duracionSesion: 60, cantJugadores: 2 }
    ]);
    (apiModule.api as any).mockResolvedValue([]);
  });

  it('renderiza la lista de sesiones y muestra el estado Planificada', async () => {
    render(<SesionesPage />);
    await waitFor(() => expect(screen.getByText('Gestión de Sesiones')).toBeInTheDocument());
    expect(screen.getByText('Planificada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ver detalle/i })).toBeInTheDocument();
  });
});
