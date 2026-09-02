import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest'; 
import UsersPage from '../UsersPage';
import { UserProvider } from '../../context/UserContext'; // <-- ¡ESTA ES LA LÍNEA QUE FALTABA!

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: { idUsuario: 'admin-123', nickname: 'admin' },
    usuarios: [
      { idUsuario: 'admin-123', nickname: 'admin', rol: 'anfitrion' },
      { idUsuario: 'user-456', nickname: 'pepito', rol: 'jugador' }
    ],
    jugadores: [
      { idUsuario: 'user-456', nickname: 'pepito', rol: 'jugador' }
    ],
    anfitriones: [
      { idUsuario: 'admin-123', nickname: 'admin', rol: 'anfitrion' }
    ],
    // ¡AQUÍ ESTÁ EL TRUCO! 'anfitrion' SIN TILDE:
    rolDe: (id: string) => id === 'admin-123' ? 'anfitrion' : 'jugador'
  }),
  UserProvider: ({ children }: any) => <>{children}</>
}));

const UsersPageWrapper = () => (
  <BrowserRouter>
    <UserProvider>
      <UsersPage />
    </UserProvider>
  </BrowserRouter>
);

describe('UsersPage', () => {
  it('debe renderizar la tabla de usuarios', () => {
    render(<UsersPageWrapper />);

    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
    expect(screen.getByText(/Total Usuarios/i)).toBeInTheDocument();
  });

  it('debe mostrar botón + Nuevo Usuario solo si es Anfitrión', () => {
    // El usuario logueado default es "admin" que es anfitrión
    render(<UsersPageWrapper />);

    // Debe estar visible para admin (anfitrión)
    const btnNuevoUsuario = screen.getByText('+ Nuevo Usuario');
    expect(btnNuevoUsuario).toBeInTheDocument();
  });

  it('debe mostrar la tabla con usuarios registrados', () => {
    render(<UsersPageWrapper />);

    // Admin se crea por default en el contexto
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

it('debe permitir crear un nuevo usuario (si es anfitrión)', async () => {
  render(<UsersPageWrapper />);

  const btnNuevo = screen.getByText('+ Nuevo Usuario');
  fireEvent.click(btnNuevo);

  // Verificamos que el formulario se despliega buscando su título o el label
  await waitFor(() => {
    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument();
  });
});

  it('debe mostrar stats de usuarios, jugadores y anfitriones', () => {
    render(<UsersPageWrapper />);

    expect(screen.getByText(/Total Usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Jugadores/i)).toBeInTheDocument();
    expect(screen.getByText(/Anfitriones/i)).toBeInTheDocument();
  });

  it('debe mostrar badges con roles correctos', () => {
    render(<UsersPageWrapper />);

    // Admin es anfitrión por default
    const badges = screen.getAllByText('anfitrion');
    expect(badges.length).toBeGreaterThan(0);
  });
});
