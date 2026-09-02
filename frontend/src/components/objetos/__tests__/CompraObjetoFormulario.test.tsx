import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CompraObjetoFormulario from '../CompraObjetoFormulario';
import type { Personaje } from '../../../interfaces';
import type { ObjetoPublico } from '../../../services/objeto.service';

const objeto: ObjetoPublico = {
  idObjeto: 5,
  nombre: 'Espada',
  descripcion: 'Espada de hierro',
  tipoObjeto: 'Arma',
  valor: 40,
  nivelObjeto: 1,
  idTienda: 1,
  idPersonaje: null,
  numInventario: null,
  posicion: 0,
};

const personaje: Personaje = {
  idPersonaje: 10,
  nombreFicticio: 'Arthas',
  raza: 'Humano',
  xp: 0,
  nivel: 1,
  dinero: 100,
  idClase: 1,
  idUsuarioJugador: 1,
  idPartida: 1,
};

describe('CompraObjetoFormulario', () => {
  it('envía personaje, inventario y posición al confirmar', async () => {
    const onComprar = vi.fn().mockResolvedValue(undefined);

    render(
      <CompraObjetoFormulario
        objeto={objeto}
        personajes={[personaje]}
        onComprar={onComprar}
        onCancelar={() => undefined}
      />,
    );

    fireEvent.change(screen.getByLabelText('Número de inventario'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Posición'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    await waitFor(() => {
      expect(onComprar).toHaveBeenCalledWith({ idPersonaje: 10, numInventario: 2, posicion: 3 });
    });
  });

  it('impide comprar cuando no hay personajes', () => {
    render(
      <CompraObjetoFormulario
        objeto={objeto}
        personajes={[]}
        onComprar={() => undefined}
        onCancelar={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled();
    expect(screen.getByText(/No hay personajes disponibles/i)).toBeInTheDocument();
  });
});
