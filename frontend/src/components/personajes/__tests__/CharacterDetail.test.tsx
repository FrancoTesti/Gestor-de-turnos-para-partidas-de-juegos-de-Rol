import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { PersonajeDetalle } from '../CharacterDetail';
import type { Personaje, Clase } from '../../../interfaces';

describe('PersonajeDetalle', () => {
  const personajeMock: Personaje = {
    idPersonaje: 1,
    nombreFicticio: 'Thorin Escudo de Roble',
    raza: 'Enano',
    nivel: 3,
    xp: 350,
    dinero: 500,
    idClase: 1,
    claseNombre: 'Guerrero',
    idUsuarioJugador: 10,
    jugadorNombre: 'jugador10',
    idPartida: 2,
    partidaNombre: 'Erebor',
  } as Personaje;

  const clasesMock: Clase[] = [
    { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Combate cuerpo a cuerpo' },
  ];

  it('muestra los datos completos del personaje y botón "Ver inventarios"', () => {
    render(
      <MemoryRouter>
        <PersonajeDetalle personaje={personajeMock} clases={clasesMock} />
      </MemoryRouter>
    );

    expect(screen.getByText('Thorin Escudo de Roble')).toBeInTheDocument();
    expect(screen.getByText('Ficha de Personaje #1')).toBeInTheDocument();
    expect(screen.getByText(/Enano • Guerrero/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();

    const linkInventarios = screen.getByRole('link', { name: /ver inventarios/i });
    expect(linkInventarios).toBeInTheDocument();
    expect(linkInventarios).toHaveClass('btn-emerald');
    expect(linkInventarios).toHaveAttribute(
      'href',
      '/inventory?personaje=Thorin%20Escudo%20de%20Roble'
    );
  });

  it('permite llamar a onEditar cuando se provee la función', () => {
    const onEditarMock = vi.fn();
    render(
      <MemoryRouter>
        <PersonajeDetalle personaje={personajeMock} onEditar={onEditarMock} />
      </MemoryRouter>
    );

    const btnEditar = screen.getByRole('button', { name: /editar este personaje/i });
    expect(btnEditar).toBeInTheDocument();
    fireEvent.click(btnEditar);
    expect(onEditarMock).toHaveBeenCalledWith(personajeMock);
  });

  it('funciona correctamente fuera de un Router renderizando enlace estándar', () => {
    render(<PersonajeDetalle personaje={personajeMock} />);

    const linkInventarios = screen.getByRole('link', { name: /ver inventarios/i });
    expect(linkInventarios).toBeInTheDocument();
    expect(linkInventarios).toHaveAttribute(
      'href',
      '/inventory?personaje=Thorin%20Escudo%20de%20Roble'
    );
  });
});
