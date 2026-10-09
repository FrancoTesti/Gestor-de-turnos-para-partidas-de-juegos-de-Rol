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

it('mantiene el detalle del inventario abierto al mover un objeto a otro casillero', async () => {
  const inventario = { idPersonaje: 10, numInventario: 1, cantidadEspacio: 4 };
  const objetoInicial = { idObjeto: 5, nombre: 'Poción de Vida', posicion: 0, valor: 100 };
  const objetoMovido = { idObjeto: 5, nombre: 'Poción de Vida', posicion: 2, valor: 100 };

  mocks.api.mockImplementation(async (path: string, method = 'GET') => {
    if (path === '/inventarios' && method === 'GET') return [inventario];
    if (path === '/inventarios/10/1' && method === 'GET') {
      return { ...inventario, objetos: mocks.api.mock.calls.some(c => String(c[0]).includes('/mover')) ? [objetoMovido] : [objetoInicial] };
    }
    if (path === '/objetos' && method === 'GET') return [objetoInicial];
    if (path === '/tiendas' && method === 'GET') return [{ idTienda: 1, nombre: 'Alquimia' }];
    if (method === 'POST') return {};
    return [];
  });

  render(<ModulePage resource="inventarios" />);
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /Ver detalle/ }));
  await waitFor(() => expect(screen.getByText('Mochila / Inventario #1')).toBeInTheDocument());

  fireEvent.change(screen.getByLabelText('Objeto del personaje'), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText(/Posición destino/), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Mover objeto' }));

  await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/inventarios/10/1/mover', 'POST', { idObjeto: 5, posicion: 2 }));
  expect(screen.getByText('Mochila / Inventario #1')).toBeInTheDocument();
});

it('permite seleccionar un objeto del inventario, abrir el modal de venta y confirmar la venta manteniendo el detalle abierto', async () => {
  const inventario = { idPersonaje: 10, numInventario: 1, cantidadEspacio: 4 };
  const objeto = { idObjeto: 8, nombre: 'Daga Oxidada', posicion: 0, valor: 100 };

  mocks.api.mockImplementation(async (path: string, method = 'GET') => {
    if (path === '/inventarios' && method === 'GET') return [inventario];
    if (path === '/inventarios/10/1' && method === 'GET') {
      return { ...inventario, objetos: mocks.api.mock.calls.some(c => String(c[0]).includes('/vender')) ? [] : [objeto] };
    }
    if (path === '/objetos' && method === 'GET') return [objeto];
    if (path === '/tiendas' && method === 'GET') return [{ idTienda: 1, nombre: 'Armería' }];
    if (method === 'POST') return {};
    return [];
  });

  render(<ModulePage resource="inventarios" />);
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /Ver detalle/ }));
  await waitFor(() => expect(screen.getByText('Mochila / Inventario #1')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Daga Oxidada'));

  const btnVender = screen.getByRole('button', { name: '🏷️ Vender' });
  expect(btnVender).toBeInTheDocument();
  fireEvent.click(btnVender);

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Vender Daga Oxidada')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Venta' }));

  await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/objetos/8/vender', 'POST', { idPersonaje: 10, idTienda: 1, precio: 100 }));
  expect(screen.getByText('Mochila / Inventario #1')).toBeInTheDocument();
});
