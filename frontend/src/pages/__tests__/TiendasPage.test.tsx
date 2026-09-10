import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import TiendasPage from '../TiendasPage';
import type { Tienda, Clase } from '../../interfaces';

const mocks = vi.hoisted(() => {
  const mockTiendas: Tienda[] = [
    { idTienda: 1, nombre: 'Armería Real', claseTienda: 'Armas', idClase: 1 },
    { idTienda: 2, nombre: 'Boticario Mágico', claseTienda: 'Pociones', idClase: null },
  ];

  const mockClases: Clase[] = [
    { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Fuerza' },
  ];

  return { mockTiendas, mockClases };
});

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: { idUsuario: 1, nickname: 'admin' },
    rolDe: (id: number) => (id === 1 ? 'anfitrion' : 'jugador'),
  }),
}));

vi.mock('../../services/tienda.service', () => ({
  obtenerTiendas: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockTiendas)),
  crearTienda: vi.fn().mockImplementation((data) => Promise.resolve({ idTienda: 3, ...data })),
  actualizarTienda: vi.fn().mockImplementation((id, data) => Promise.resolve({ idTienda: id, ...data })),
  eliminarTienda: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../services/clase.service', () => ({
  obtenerClases: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockClases)),
}));

describe('TiendasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el listado de tiendas al cargar', async () => {
    render(<TiendasPage />);
    expect(screen.getByText(/⏳ Cargando tiendas…/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Armería Real/i)).toBeInTheDocument();
      expect(screen.getByText(/Boticario Mágico/i)).toBeInTheDocument();
    });
  });

  it('permite filtrar tiendas por búsqueda de texto y tipo', async () => {
    render(<TiendasPage />);
    await waitFor(() => expect(screen.getByText(/Armería Real/i)).toBeInTheDocument());

    const inputSearch = screen.getByPlaceholderText('Nombre o tipo');
    fireEvent.change(inputSearch, { target: { value: 'Armería' } });

    expect(screen.getByText(/Armería Real/i)).toBeInTheDocument();
    expect(screen.queryByText(/Boticario Mágico/i)).not.toBeInTheDocument();
  });

  it('permite a un anfitrión abrir y crear una nueva tienda', async () => {
    render(<TiendasPage />);
    await waitFor(() => expect(screen.getByText(/Armería Real/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva Tienda/i }));
    expect(screen.getByRole('heading', { name: 'Nueva Tienda' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Ej: Forja de Hierro Negro'), {
      target: { value: 'Forja Mística' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Tienda' }));

    await waitFor(() => {
      expect(screen.getByText(/Tienda creada correctamente/i)).toBeInTheDocument();
    });
  });
});
