import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { vi } from 'vitest';

// Creamos espías para verificar que la página llame a la función del contexto
const mockLoguearse = vi.fn();

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarios: [{ idUsuario: 1, nickname: 'admin', contrasena: '123456' }],
    usuarioLogueado: null,
    mensaje: '',
    loguearse: mockLoguearse,
    limpiarMensaje: vi.fn(),
  }),
  UserProvider: ({ children }: any) => <>{children}</>,
}));

const LoginPageWrapper = () => (
  <BrowserRouter>
    <LoginPage />
  </BrowserRouter>
);

describe('LoginPage', () => {
  it('debe renderizar el formulario de login', () => {
    render(<LoginPageWrapper />);

    expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nickname/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contraseña/i)).toBeInTheDocument();
  });

  it('debe mostrar error si usuario no existe', () => {
    render(<LoginPageWrapper />);

    const inputUsuario = screen.getByPlaceholderText(/Nickname/i);
    const inputPassword = screen.getByPlaceholderText(/Contraseña/i);
    const btnLogin = screen.getByRole('button', { name: /Ingresar/i });

    fireEvent.change(inputUsuario, { target: { value: 'usuario_inexistente' } });
    fireEvent.change(inputPassword, { target: { value: '123456' } });
    fireEvent.click(btnLogin);

    expect(mockLoguearse).toHaveBeenCalledWith('usuario_inexistente', '123456');
  });

  it('debe permitir acceder con credenciales válidas', () => {
    render(<LoginPageWrapper />);

    const inputUsuario = screen.getByPlaceholderText(/Nickname/i);
    const inputPassword = screen.getByPlaceholderText(/Contraseña/i);
    const btnLogin = screen.getByRole('button', { name: /Ingresar/i });

    fireEvent.change(inputUsuario, { target: { value: 'admin' } });
    fireEvent.change(inputPassword, { target: { value: '123456' } });
    fireEvent.click(btnLogin);

    // Verifica que el formulario procesó el ingreso enviando los datos correctos al Context
    expect(mockLoguearse).toHaveBeenCalledWith('admin', '123456');
  });

  it('debe tener link para ir a registro', () => {
    render(<LoginPageWrapper />);

    const registerBtn = screen.getByRole('button', { name: /Ir a Registro/i });
    expect(registerBtn).toBeInTheDocument();
  });
});