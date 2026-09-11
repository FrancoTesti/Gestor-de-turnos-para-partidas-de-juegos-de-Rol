import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MisionesPage from '../MisionesPage';
import * as misionService from '../../services/mision.service';
import * as apiModule from '../../services/api';
import * as userContextModule from '../../context/UserContext';

vi.mock('../../services/mision.service');
vi.mock('../../services/api');
vi.mock('../../services/sesion.service');
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
    (misionService.obtenerMisiones as any).mockResolvedValue([
      { idPartida: 1, numSesion: 1, numMision: 1, dineroTotal: 100, xpTotal: 50, estado: false }
    ]);
    (apiModule.api as any).mockResolvedValue([]);
  });

  it('renderiza la misión pendiente y muestra los totales', async () => {
    render(<MisionesPage />);
    await waitFor(() => expect(screen.getByText('Gestión de Misiones')).toBeInTheDocument());
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Repartir/i })).toBeInTheDocument();
  });
});
