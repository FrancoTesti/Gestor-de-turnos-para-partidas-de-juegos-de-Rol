import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import UsersPage from '../UsersPage';
const mocks = vi.hoisted(() => ({ reload: vi.fn(), logout: vi.fn(), api: vi.fn() }));
vi.mock('../../context/UserContext', () => ({ useUser: () => ({
  usuarioLogueado: { idUsuario: 1, nickname: 'admin' },
  usuarios: [{ idUsuario: 1, nickname: 'admin', nombreUsuario: 'Administrador', imagen: '' }, { idUsuario: 2, nickname: 'pepito', nombreUsuario: 'Pepe', imagen: '' }],
  rolDe: (id: number) => id === 1 ? 'anfitrion' : 'jugador', recargar: mocks.reload, logout: mocks.logout,
}) }));
vi.mock('../../services/api', () => ({ api: mocks.api }));
beforeEach(() => { vi.clearAllMocks(); mocks.api.mockResolvedValue({}); mocks.reload.mockResolvedValue(undefined); });
describe('Usuarios conectados a la API', () => {
  it('lista usuarios y abre detalle', () => {
    render(<UsersPage />); expect(screen.getByText(/Listado de usuarios \(2\)/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('admin')); expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
  });
  it('no permite editar o borrar una cuenta ajena', () => {
    render(<UsersPage />); fireEvent.click(screen.getByText('pepito'));
    expect(screen.queryByRole('button', { name: /Editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar/i })).not.toBeInTheDocument();
  });
  it('crea en el servidor y recarga el listado', async () => {
    render(<UsersPage />); fireEvent.click(screen.getByRole('button', { name: /Nuevo usuario/i }));
    fireEvent.change(screen.getByLabelText(/Nombre de usuario/), { target: { value: 'Nuevo usuario' } });
    fireEvent.change(screen.getByLabelText(/Nickname/), { target: { value: 'nuevo' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/usuarios', 'POST', { nombreUsuario: 'Nuevo usuario', nickname: 'nuevo', contrasena: 'pass123', imagen: '' }));
    await waitFor(() => expect(mocks.reload).toHaveBeenCalled());
  });
  it('actualiza sin mandar id ni contraseña vacía', async () => {
    render(<UsersPage />); fireEvent.click(screen.getByText('admin')); fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.change(screen.getByLabelText(/Nickname/), { target: { value: 'editado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/usuarios/1', 'PUT', { nombreUsuario: 'Administrador', nickname: 'editado', imagen: '' }));
  });
  it('mantiene formulario y muestra error cuando falla el guardado', async () => {
    mocks.api.mockRejectedValue(new Error('El nickname ya está en uso'));
    render(<UsersPage />); fireEvent.click(screen.getByText('admin')); fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El nickname ya está en uso'); expect(mocks.reload).not.toHaveBeenCalled();
  });
  it('elimina realmente la cuenta y cierra sesión', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<UsersPage />); fireEvent.click(screen.getByText('admin')); fireEvent.click(screen.getByRole('button', { name: /Eliminar/i }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/usuarios/1', 'DELETE'));
    await waitFor(() => expect(mocks.logout).toHaveBeenCalled());
  });
});
