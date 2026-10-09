import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PartidaDetalle from '../PartidaDetalle';
import type { PartidaPublica } from '../../../services/partida.service';

const partidaMock: PartidaPublica = {
  idPartida: 42,
  nombre: 'Campaña Sombría',
  idUsuarioAnfitrion: 1,
  nicknameAnfitrion: 'DM_Master',
  estado: 'activa',
  esPrivada: false,
  limiteJugadores: 5,
};

describe('PartidaDetalle', () => {
  it('muestra mensaje vacio si no hay partida seleccionada', () => {
    render(<PartidaDetalle partida={null} />);
    expect(screen.getByText('Seleccioná una partida de la lista para ver sus datos.')).toBeInTheDocument();
  });

  it('muestra cargando cuando está en estado de carga', () => {
    render(<PartidaDetalle cargando />);
    expect(screen.getByText('Cargando información de la partida...')).toBeInTheDocument();
  });

  it('muestra error si se pasa un mensaje de error', () => {
    const onCerrar = vi.fn();
    render(<PartidaDetalle error="Fallo al obtener datos" onCerrar={onCerrar} />);
    expect(screen.getByText('Fallo al obtener datos')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('renderiza la información completa de la partida y jugadores unidos', () => {
    const personajesUnidos = [
      { idPersonaje: 1, nombreFicticio: 'Aragorn', raza: 'Humano', nivel: 5, nickname: 'Pepe' },
    ];
    const onEditar = vi.fn();
    const onEliminar = vi.fn();

    render(
      <PartidaDetalle
        partida={partidaMock}
        personajesUnidos={personajesUnidos}
        onEditar={onEditar}
        onEliminar={onEliminar}
      />
    );

    expect(screen.getByRole('heading', { name: 'Campaña Sombría' })).toBeInTheDocument();
    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.getByText('@DM_Master')).toBeInTheDocument();
    expect(screen.getByText('Aragorn')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Editar/ }));
    expect(onEditar).toHaveBeenCalledWith(partidaMock);

    fireEvent.click(screen.getByRole('button', { name: /Eliminar/ }));
    expect(onEliminar).toHaveBeenCalledWith(42);
  });
});
