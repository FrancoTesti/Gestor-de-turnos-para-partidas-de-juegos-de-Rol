import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { TiendasPage } from '../ShopsPage';
import type { Tienda, Clase } from '../../interfaces';

const mocks = vi.hoisted(() => {
  const mockTiendas: Tienda[] = [
    { idTienda: 1, nombre: 'Armería Real', claseTienda: 'Armas', idClase: 1 },
    { idTienda: 2, nombre: 'Boticario Mágico', claseTienda: 'Pociones', idClase: null },
  ];

  const mockClases: Clase[] = [
    { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Fuerza' },
  ];

  let currentRole = 'anfitrion';

  return {
    mockTiendas,
    mockClases,
    getRole: () => currentRole,
    setRole: (r: string) => {
      currentRole = r;
    },
  };
});

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: { idUsuario: 1, nickname: 'admin' },
    rolDe: () => mocks.getRole(),
  }),
}));

vi.mock('../../services/api', () => ({
  api: vi.fn().mockImplementation((url: string) => {
    if (url === '/personajes') {
      return Promise.resolve([
        {
          idPersonaje: 10,
          nombreFicticio: 'MiGuerrero',
          raza: 'Humano',
          xp: 0,
          nivel: 2,
          dinero: 1000,
          idClase: 1,
          idUsuarioJugador: 1,
          idPartida: 1,
        },
      ]);
    }
    return Promise.resolve([]);
  }),
}));

vi.mock('../../services/shop.service', () => ({
  getShops: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockTiendas)),
  createShop: vi.fn().mockImplementation((data) => Promise.resolve({ idTienda: 3, ...data })),
  updateShop: vi.fn().mockImplementation((id, data) => Promise.resolve({ idTienda: id, ...data })),
  deleteShop: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../services/class.service', () => ({
  getClasses: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockClases)),
}));

vi.mock('../../services/item.service', () => {
  const mockItemsData = [
    {
      idObjeto: 1,
      nombre: 'Espada Legendaria',
      descripcion: 'Espada forjada por dioses',
      tipoObjeto: 'Arma',
      valor: 500,
      nivelObjeto: 5,
      esUnico: true,
      idTienda: 1,
      idPersonaje: null,
      numInventario: null,
      posicion: 0,
    },
    {
      idObjeto: 2,
      nombre: 'Instancia Comprada',
      descripcion: 'Ya en posesión de un personaje',
      tipoObjeto: 'Arma',
      valor: 100,
      nivelObjeto: 1,
      esUnico: false,
      idTienda: 1,
      idPersonaje: 99,
      numInventario: 1,
      posicion: 0,
    },
    {
      idObjeto: 3,
      nombre: 'Arco Compuesto',
      descripcion: 'Arco veloz de precisión',
      tipoObjeto: 'Arma',
      valor: 250,
      nivelObjeto: 2,
      esUnico: false,
      idTienda: 1,
      idPersonaje: null,
      numInventario: null,
      posicion: 0,
    },
  ];

  return {
    getItems: vi.fn().mockResolvedValue(mockItemsData),
    purchaseItem: vi.fn().mockResolvedValue({}),
  };
});

describe('TiendasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setRole('anfitrion');
  });

  it('muestra el listado de tiendas al cargar', async () => {
    render(<TiendasPage />);
    expect(screen.getByText(/Cargando tiendas/i)).toBeInTheDocument();

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

  it('abre el catálogo de una tienda, muestra la plantilla con el nuevo diseño y no muestra instancias compradas', async () => {
    render(<TiendasPage />);
    await waitFor(() => expect(screen.getByText(/Armería Real/i)).toBeInTheDocument());

    const verCatalogoBtns = screen.getAllByRole('button', { name: /Ver catálogo/i });
    fireEvent.click(verCatalogoBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Catálogo de Objetos/i)).toBeInTheDocument();
    });

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveStyle({ width: '100%' });
    expect(aside).not.toHaveStyle({ maxWidth: '680px' });
    expect(within(aside).getByText(/Arco Compuesto/i)).toBeInTheDocument();
    expect(within(aside).getByText(/Espada Legendaria/i)).toBeInTheDocument();
    const items = within(aside).getAllByText(/(Arco Compuesto|Espada Legendaria)/i);
    expect(items[0]).toHaveTextContent('Arco Compuesto');
    expect(items[1]).toHaveTextContent('Espada Legendaria');
    expect(within(aside).getByText(/500/)).toBeInTheDocument();
    expect(within(aside).getByText('#1')).toBeInTheDocument();
    expect(within(aside).getByText(/Nivel 5/)).toBeInTheDocument();
    expect(within(aside).getByText(/Único/)).toBeInTheDocument();
    expect(within(aside).getByText(/Se puede vender/i)).toBeInTheDocument();
    // Instancia ya comprada no debe aparecer en la tienda
    expect(within(aside).queryByText(/Instancia Comprada/i)).not.toBeInTheDocument();
  });

  it('no permite comprar objetos en la tienda ya que la compra es exclusiva de Catálogo > Objetos', async () => {
    // Probar tanto para anfitrión como para jugador
    mocks.setRole('jugador');
    render(<TiendasPage />);
    await waitFor(() => expect(screen.getByText(/Armería Real/i)).toBeInTheDocument());

    const verCatalogoBtns = screen.getAllByRole('button', { name: /Ver catálogo/i });
    fireEvent.click(verCatalogoBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Catálogo de Objetos/i)).toBeInTheDocument();
    });

    const aside = screen.getByRole('complementary');
    // No debe haber botón de Comprar ni selector de comprar como personaje
    expect(within(aside).queryByRole('button', { name: /Comprar/i })).not.toBeInTheDocument();
    expect(within(aside).queryByLabelText(/Comprar como/i)).not.toBeInTheDocument();
    expect(within(aside).queryByText(/Los anfitriones administran las tiendas/i)).not.toBeInTheDocument();
  });
});
