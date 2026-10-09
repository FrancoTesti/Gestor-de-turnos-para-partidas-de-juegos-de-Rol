import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PersonajeFormulario from '../PersonajeFormulario';
import type { JugadorExtendido } from '../../../services/jugador.service';

const clases = [{ idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Fuerza bruta' }];
const jugadores: JugadorExtendido[] = [
  { idUsuario: 10, nombreUsuario: 'Juan Pérez', nickname: 'juanp', imagen: '', estado: true }
];
const partidas = [{ idPartida: 5, nombre: 'Aventura Inicial', idUsuarioAnfitrion: 2, nicknameAnfitrion: 'host', estado: 'activa' as const, esPrivada: false, limiteJugadores: 4 }];

describe('PersonajeFormulario', () => {
  it('valida campos obligatorios y guarda datos', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    const onCancelar = vi.fn();

    render(
      <PersonajeFormulario
        clasesDisponibles={clases}
        jugadoresDisponibles={jugadores}
        partidasDisponibles={partidas}
        onGuardar={onGuardar}
        onCancelar={onCancelar}
      />
    );

    await waitFor(() => expect(screen.queryByText(/Cargando/)).not.toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Nombre Ficticio/), { target: { value: 'Gimli' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enano' })); // Chip de raza

    fireEvent.click(screen.getByRole('button', { name: 'Crear Personaje' }));

    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith({
      nombreFicticio: 'Gimli',
      raza: 'Enano',
      idClase: 1,
      idUsuarioJugador: 10,
      idPartida: 5,
      nivel: 1,
      xp: 0,
      dinero: 100,
    }));
  });

  it('permite cancelar el formulario', async () => {
    const onCancelar = vi.fn();
    render(
      <PersonajeFormulario
        clasesDisponibles={clases}
        jugadoresDisponibles={jugadores}
        partidasDisponibles={partidas}
        onGuardar={vi.fn()}
        onCancelar={onCancelar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
