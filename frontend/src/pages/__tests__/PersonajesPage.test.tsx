import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import PersonajesPage from '../PersonajesPage';
import type { Personaje, Clase } from '../../interfaces';

const mocks = vi.hoisted(() => {
  const mockPersonajes: Personaje[] = [
    {
      idPersonaje: 1,
      nombreFicticio: 'Thorin',
      raza: 'Enano',
      nivel: 2,
      xp: 150,
      dinero: 250,
      idClase: 1,
      claseNombre: 'Guerrero',
      idUsuarioJugador: 10,
      jugadorNombre: 'jugador10',
      idPartida: 1,
      partidaNombre: 'Mina Perdida',
    } as Personaje,
    {
      idPersonaje: 2,
      nombreFicticio: 'Gandalf',
      raza: 'Humano',
      nivel: 5,
      xp: 900,
      dinero: 500,
      idClase: 2,
      claseNombre: 'Mago',
      idUsuarioJugador: 10,
      jugadorNombre: 'jugador10',
      idPartida: 2,
      partidaNombre: 'Torre Arcana',
    } as Personaje,
  ];

  const mockClases: Clase[] = [
    { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Fuerza y combate' },
    { idClase: 2, nombreClase: 'Mago', descripcionClase: 'Magia arcana' },
  ];

  const mockPartidas = [
    { idPartida: 1, nombre: 'Mina Perdida', estado: 'activa', limiteJugadores: 4, esPrivada: false },
    { idPartida: 2, nombre: 'Torre Arcana', estado: 'activa', limiteJugadores: 2, esPrivada: true },
  ];

  return { mockPersonajes, mockClases, mockPartidas };
});

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: { idUsuario: 10, nickname: 'jugador10' },
    jugadores: [{ idUsuario: 10, nickname: 'jugador10', estado: true }],
    rolDe: (_id: number) => 'jugador',
  }),
}));

vi.mock('../../services/api', () => ({
  api: vi.fn().mockImplementation((url: string) => {
    if (url === '/partidas') return Promise.resolve(mocks.mockPartidas);
    return Promise.resolve([]);
  }),
}));

vi.mock('../../services/clase.service', () => ({
  obtenerClases: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockClases)),
}));

vi.mock('../../services/personaje.service', () => ({
  obtenerPersonajes: vi.fn().mockImplementation(() => Promise.resolve(mocks.mockPersonajes)),
  crearPersonaje: vi.fn().mockImplementation((data) =>
    Promise.resolve({ idPersonaje: 3, ...data, nivel: 1, xp: 0, dinero: 100 }),
  ),
  actualizarPersonaje: vi.fn().mockImplementation((id, data) =>
    Promise.resolve({ idPersonaje: id, ...data }),
  ),
  eliminarPersonaje: vi.fn().mockResolvedValue(undefined),
}));

describe('PersonajesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el listado de personajes y sus datos al cargar', async () => {
    render(<PersonajesPage />);

    await waitFor(() => {
      expect(screen.getByText('Thorin')).toBeInTheDocument();
      expect(screen.getByText('Gandalf')).toBeInTheDocument();
      expect(screen.getByText(/Enano/i)).toBeInTheDocument();
      expect(screen.getByText(/Humano/i)).toBeInTheDocument();
    });
  });

  it('permite filtrar personajes por clase y limpiar el filtro', async () => {
    render(<PersonajesPage />);
    await waitFor(() => expect(screen.getByText('Thorin')).toBeInTheDocument());

    const selectFiltro = screen.getByLabelText(/Filtrar por Clase:/i);
    fireEvent.change(selectFiltro, { target: { value: '1' } });

    expect(screen.getByText('Thorin')).toBeInTheDocument();
    expect(screen.queryByText('Gandalf')).not.toBeInTheDocument();

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtro/i });
    fireEvent.click(btnLimpiar);

    expect(screen.getByText('Gandalf')).toBeInTheDocument();
  });

  it('solicita contraseña solo cuando se selecciona una partida privada', async () => {
    render(<PersonajesPage />);
    await waitFor(() => expect(screen.getByText('Thorin')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /\+ Crear Personaje/i }));
    expect(screen.getByRole('heading', { name: 'Crear Nuevo Personaje' })).toBeInTheDocument();

    // Partida 1 es pública
    const selectPartida = screen.getByLabelText(/^Partida \*/i);
    fireEvent.change(selectPartida, { target: { value: '1' } });

    expect(screen.queryByLabelText(/Contraseña de la partida privada/i)).not.toBeInTheDocument();

    // Partida 2 es privada
    fireEvent.change(selectPartida, { target: { value: '2' } });
    expect(screen.getByLabelText(/Contraseña de la partida privada/i)).toBeInTheDocument();
  });

  it('permite a un jugador crear un personaje y muestra feedback', async () => {
    render(<PersonajesPage />);
    await waitFor(() => expect(screen.getByText('Thorin')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /\+ Crear Personaje/i }));

    fireEvent.change(screen.getByLabelText(/Nombre ficticio \*/i), {
      target: { value: 'Aragorn' },
    });
    fireEvent.change(screen.getByLabelText(/Raza \*/i), {
      target: { value: 'Dúnadan' },
    });
    fireEvent.change(screen.getByLabelText(/Clase de personaje \*/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/^Partida \*/i), {
      target: { value: '1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Personaje' }));

    await waitFor(() => {
      expect(screen.getByText(/Personaje creado correctamente/i)).toBeInTheDocument();
    });
  });
});
