import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import ClasesPage from '../ClasesPage';
import type { Clase } from '../../interfaces';

const mocks = vi.hoisted(() => {
  const mockClases: Clase[] = [
    { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Fuerza y combate con espadas' },
    { idClase: 2, nombreClase: 'Mago', descripcionClase: 'Lanza conjuros arcanos poderosos' },
  ];
  return { mockClases };
});

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: { idUsuario: 1, nickname: 'master' },
    rolDe: (id: number) => (id === 1 ? 'anfitrion' : 'jugador'),
  }),
}));

vi.mock('../../services/clase.service', () => ({
  obtenerClases: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockClases)),
  crearClase: vi.fn().mockImplementation((data) => Promise.resolve({ idClase: 3, ...data })),
  actualizarClase: vi.fn().mockImplementation((id, data) => Promise.resolve({ idClase: id, ...data })),
  eliminarClase: vi.fn().mockResolvedValue(undefined),
}));

describe('ClasesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el listado de clases y el encabezado al cargar', async () => {
    render(<ClasesPage />);

    await waitFor(() => {
      expect(screen.getByText('Guerrero')).toBeInTheDocument();
      expect(screen.getByText('Mago')).toBeInTheDocument();
      expect(screen.getByText('Fuerza y combate con espadas')).toBeInTheDocument();
    });
  });

  it('permite filtrar clases por texto de búsqueda', async () => {
    render(<ClasesPage />);
    await waitFor(() => expect(screen.getByText('Guerrero')).toBeInTheDocument());

    const inputSearch = screen.getByPlaceholderText('Nombre o descripción');
    fireEvent.change(inputSearch, { target: { value: 'conjuros' } });

    expect(screen.getByText('Mago')).toBeInTheDocument();
    expect(screen.queryByText('Guerrero')).not.toBeInTheDocument();

    const btnQuitar = screen.getByRole('button', { name: 'Quitar filtro' });
    fireEvent.click(btnQuitar);

    expect(screen.getByText('Guerrero')).toBeInTheDocument();
  });

  it('permite a un anfitrión crear una nueva clase', async () => {
    render(<ClasesPage />);
    await waitFor(() => expect(screen.getByText('Guerrero')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Clase/i }));
    expect(screen.getByRole('heading', { name: /Crear Nueva Clase/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre de la Clase/i), {
      target: { value: 'Pícaro' },
    });
    fireEvent.change(screen.getByLabelText(/Descripción de la Clase/i), {
      target: { value: 'Sigilo y ataques furtivos' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Clase' }));

    await waitFor(() => {
      expect(screen.getByText(/Clase creada correctamente/i)).toBeInTheDocument();
    });
  });

  it('permite seleccionar una clase para ver su detalle', async () => {
    render(<ClasesPage />);
    await waitFor(() => expect(screen.getByText('Guerrero')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Guerrero'));

    await waitFor(() => {
      expect(screen.getByText('Cerrar detalle')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cerrar detalle'));
    expect(screen.queryByText('Cerrar detalle')).not.toBeInTheDocument();
  });
});
