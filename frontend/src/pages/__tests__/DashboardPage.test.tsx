import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../DashboardPage';

// Generar 25 usuarios para probar la paginación de 20 por página
const mockUsuarios = Array.from({ length: 25 }, (_, i) => ({
  idUsuario: i + 1,
  nickname: `usuario_${i + 1}`,
  nombreUsuario: `Nombre ${i + 1}`,
  imagen: '',
}));

vi.mock('../../context/UserContext', () => ({
  useUser: () => ({
    usuarioLogueado: { idUsuario: 21, nickname: 'Messi18122022' },
    usuarios: mockUsuarios,
    jugadores: [{ idUsuario: 21, estado: true }],
    anfitriones: [],
    rolDe: () => 'jugador',
    cargandoSesion: false,
  }),
}));

describe('DashboardPage', () => {
  it('muestra la identidad con ID de usuario y rol actual', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Messi18122022')).toBeInTheDocument();
    expect(screen.getByText(/#21/)).toBeInTheDocument();
    expect(screen.getByText('Rol actual:')).toBeInTheDocument();
    expect(screen.getAllByText(/jugador/i).length).toBeGreaterThan(0);
  });

  it('pagina el directorio de usuarios a un máximo de 20 por página', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    // Debe mostrar los primeros 20 usuarios en la página 1
    expect(screen.getByText('usuario_1')).toBeInTheDocument();
    expect(screen.getByText('usuario_20')).toBeInTheDocument();
    // El usuario 21 y 25 NO deben estar en la página 1
    expect(screen.queryByText('usuario_21')).not.toBeInTheDocument();
    expect(screen.queryByText('usuario_25')).not.toBeInTheDocument();

    // Controles de paginación
    expect(screen.getByText(/Pág\. 1 de 2/)).toBeInTheDocument();
    const btnSiguiente = screen.getByRole('button', { name: /Siguiente/i });
    expect(btnSiguiente).not.toBeDisabled();

    // Avanzar a la página 2
    fireEvent.click(btnSiguiente);
    expect(screen.getByText(/Pág\. 2 de 2/)).toBeInTheDocument();
    expect(screen.getByText('usuario_21')).toBeInTheDocument();
    expect(screen.getByText('usuario_25')).toBeInTheDocument();
    expect(screen.queryByText('usuario_1')).not.toBeInTheDocument();

    // Volver a la página 1
    const btnAnterior = screen.getByRole('button', { name: /Anterior/i });
    fireEvent.click(btnAnterior);
    expect(screen.getByText(/Pág\. 1 de 2/)).toBeInTheDocument();
    expect(screen.getByText('usuario_1')).toBeInTheDocument();
  });
});
