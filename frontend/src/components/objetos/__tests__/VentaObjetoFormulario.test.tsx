import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VentaObjetoFormulario from '../VentaObjetoFormulario';
import type { Personaje, Tienda } from '../../../interfaces';
import type { ObjetoPublico } from '../../../services/objeto.service';

const objeto: ObjetoPublico = {
  idObjeto: 5,
  nombre: 'Escudo Real',
  descripcion: 'Escudo pesado',
  tipoObjeto: 'Armadura',
  valor: 100,
  nivelObjeto: 2,
  esUnico: false,
  idTienda: null,
  idPersonaje: 10,
  numInventario: 1,
  posicion: 0,
};

const personaje: Personaje = {
  idPersonaje: 10,
  nombreFicticio: 'Arthas',
  raza: 'Humano',
  xp: 0,
  nivel: 1,
  dinero: 200,
  idClase: 1,
  idUsuarioJugador: 1,
  idPartida: 1,
};

const tienda: Tienda = {
  idTienda: 1,
  nombre: 'Mercado Central',
  claseTienda: 'General',
  idClase: null,
};

describe('VentaObjetoFormulario', () => {
  it('muestra la venta instantánea al valor máximo y el saldo resultante', () => {
    const { container } = render(
      <VentaObjetoFormulario
        objeto={objeto}
        personaje={personaje}
        tiendas={[tienda]}
        onVender={() => undefined}
        onCancelar={() => undefined}
      />,
    );

    expect(container.textContent).toContain('Precio de venta: $100');
    expect(container.textContent).toContain('Se vende de manera instantánea al valor máximo ($100)');
    expect(container.textContent).toContain('Saldo actual: $200');
    expect(container.textContent).toContain('Saldo después de la venta: $300');
  });

  it('permite enviar una venta instantánea al valor máximo sin selector de rango', async () => {
    const onVender = vi.fn().mockResolvedValue(undefined);

    render(
      <VentaObjetoFormulario
        objeto={objeto}
        personaje={personaje}
        tiendas={[tienda]}
        onVender={onVender}
        onCancelar={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmar venta/ }));

    await waitFor(() => {
      expect(onVender).toHaveBeenCalledWith({
        idPersonaje: 10,
        idTienda: 1,
        precio: 100,
      });
    });
  });
});
