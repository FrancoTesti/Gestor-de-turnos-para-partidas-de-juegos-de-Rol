import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from '../RegisterPage';

const mocks = vi.hoisted(() => ({ registrar: vi.fn(), navigate: vi.fn() }));
vi.mock('../../context/UserContext', () => ({
  useUser: () => ({ registrarUsuario: mocks.registrar, mensaje: '' }),
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: () => mocks.navigate,
}));

beforeEach(() => {
  mocks.registrar.mockReset();
  mocks.navigate.mockReset();
  mocks.registrar.mockResolvedValue(undefined);
});

const renderRegister = () => render(<MemoryRouter><RegisterPage /></MemoryRouter>);
const completar = (contrasena = 'PruebaSegura123', repetida = contrasena) => {
  fireEvent.change(screen.getByPlaceholderText('Nombre y apellido'), { target: { value: 'Emanuel Salomón' } });
  fireEvent.change(screen.getByPlaceholderText('Nickname'), { target: { value: 'emasalomon' } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: contrasena } });
  fireEvent.change(screen.getByPlaceholderText('Repetir contraseña'), { target: { value: repetida } });
};

describe('Registro de cuentas', () => {
  it('registra un jugador y lleva al login', async () => {
    renderRegister();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(mocks.registrar).toHaveBeenCalledWith('Emanuel Salomón', 'emasalomon', 'PruebaSegura123', 'jugador'));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/login'));
  });

  it('permite elegir el perfil de anfitrión', async () => {
    renderRegister();
    completar();
    fireEvent.click(screen.getByLabelText('Anfitrión'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(mocks.registrar).toHaveBeenCalledWith('Emanuel Salomón', 'emasalomon', 'PruebaSegura123', 'anfitrion'));
  });

  it('avisa si las contraseñas no coinciden y no llama al servidor', () => {
    renderRegister();
    completar('PruebaSegura123', 'otraDistinta');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(screen.getByText('Las dos contraseñas no coinciden.')).toBeInTheDocument();
    expect(mocks.registrar).not.toHaveBeenCalled();
  });

  it('exige una contraseña de al menos 6 caracteres', () => {
    renderRegister();
    completar('123');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    expect(mocks.registrar).not.toHaveBeenCalled();
  });

  it('muestra el rechazo del servidor cuando el nickname ya existe', async () => {
    mocks.registrar.mockRejectedValue(new Error('Ese nickname ya está en uso. Elegí otro para poder iniciar sesión.'));
    renderRegister();
    completar();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

    expect(await screen.findByText(/Ese nickname ya está en uso/)).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalledWith('/login');
  });
});
