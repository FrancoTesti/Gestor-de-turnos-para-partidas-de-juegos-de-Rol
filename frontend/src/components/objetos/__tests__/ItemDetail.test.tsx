import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ObjetoDetalle } from '../ItemDetail';
import type { ItemPublic, ObjetoPublico } from '../../../services/item.service';

describe('ItemDetail', () => {
  const objetoEnTienda: ItemPublic = {
    idObjeto: 1,
    nombre: 'Arco Élfico',
    descripcion: 'Arco tallado en madera ancestral',
    tipoObjeto: 'Arma',
    nivelObjeto: 4,
    valor: 200,
    esUnico: true,
    idTienda: 5,
    idPersonaje: null,
    numInventario: null,
    posicion: 1,
  };

  const objetoUnicoComprado: ObjetoPublico = {
    idObjeto: 2,
    nombre: 'Anillo Único',
    descripcion: 'Un anillo para gobernarlos a todos',
    tipoObjeto: 'Reliquia',
    nivelObjeto: 10,
    valor: 9999,
    esUnico: true,
    idTienda: null,
    idPersonaje: 7,
    numInventario: 1,
    posicion: 2,
  };

  it('muestra el botón "Comprar objeto" cuando el objeto está en tienda y se provee onComprar', () => {
    const onComprar = vi.fn();
    render(
      <ObjetoDetalle
        objeto={objetoEnTienda}
        nombreTienda="Armería Élfica"
        onComprar={onComprar}
      />
    );

    expect(screen.getByText('Arco Élfico')).toBeInTheDocument();
    const btnComprar = screen.getByRole('button', { name: /comprar objeto/i });
    expect(btnComprar).toBeInTheDocument();
    expect(btnComprar).not.toBeDisabled();

    fireEvent.click(btnComprar);
    expect(onComprar).toHaveBeenCalledTimes(1);
  });

  it('muestra un botón rojo deshabilitado que dice "Ya comprado" cuando un objeto único ya fue comprado', () => {
    render(
      <ObjetoDetalle
        objeto={objetoUnicoComprado}
        onComprar={vi.fn()}
      />
    );

    expect(screen.getByText('Anillo Único')).toBeInTheDocument();
    const btnYaComprado = screen.getByRole('button', { name: /ya comprado/i });
    expect(btnYaComprado).toBeInTheDocument();
    expect(btnYaComprado).toBeDisabled();
    expect(btnYaComprado).toHaveClass('btn-ya-comprado');
    expect(screen.queryByRole('button', { name: /comprar objeto/i })).not.toBeInTheDocument();
  });
});
