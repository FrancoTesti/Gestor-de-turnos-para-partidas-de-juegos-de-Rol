import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { vi, beforeEach, describe, it, expect } from 'vitest';
const mocks = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('../../context/UserContext', () => ({ useUser: () => ({ usuarioLogueado: null, loguearse: mocks.login }) }));
beforeEach(() => { mocks.login.mockReset(); mocks.login.mockResolvedValue(undefined); });
const renderLogin = () => render(<MemoryRouter><LoginPage /></MemoryRouter>);
const submit = () => {
  fireEvent.change(screen.getByPlaceholderText('Nickname'), { target: { value: 'player' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'pass123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
};
describe('Login servidor', () => {
  it('muestra formulario y acceso a registro', () => { renderLogin(); expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Ir a Registro' })).toBeInTheDocument(); });
  it('consulta al servidor sin buscar contraseñas en una lista local', async () => { renderLogin(); submit(); await waitFor(() => expect(mocks.login).toHaveBeenCalledWith('player', 'pass123')); await waitFor(() => expect(screen.getByRole('button', { name: 'Ingresar' })).not.toBeDisabled()); });
  it('muestra rechazo del servidor', async () => { mocks.login.mockRejectedValue(new Error('Usuario o contraseña incorrecta')); renderLogin(); submit(); expect(await screen.findByText('Usuario o contraseña incorrecta')).toBeInTheDocument(); });
  it('no envía campos vacíos', () => { renderLogin(); fireEvent.click(screen.getByRole('button', { name: 'Ingresar' })); expect(screen.getByText('Completa todos los campos')).toBeInTheDocument(); expect(mocks.login).not.toHaveBeenCalled(); });
});
