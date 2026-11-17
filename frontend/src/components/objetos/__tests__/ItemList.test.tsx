import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ObjetoLista } from '../ItemList';
import type { ItemPublic, ObjetoPublico } from '../../../services/item.service';

const objetoMock: ItemPublic = {
  idObjeto: 1,
  nombre: 'Espada Mágica',
  descripcion: 'Corta el aire con filo ardiente',
  tipoObjeto: 'Arma',
  nivelObjeto: 5,
  valor: 150,
  esUnico: true,
  idTienda: null,
  idPersonaje: null,
  numInventario: null,
  posicion: 0,
};

const objetoPersonaje: ObjetoPublico = {
  idObjeto: 2,
  nombre: 'Escudo de Roble',
  descripcion: 'Protección resistente',
  tipoObjeto: 'Armadura',
  nivelObjeto: 2,
  valor: 50,
  esUnico: false,
  idTienda: null,
  idPersonaje: 10,
  numInventario: 1,
  posicion: 0,
};

describe('ObjetoLista', () => {
  it('muestra mensaje de cargando', () => {
    render(<ObjetoLista objetos={[]} cargando onSeleccionar={vi.fn()} />);
    expect(screen.getByText('Cargando objetos...')).toBeInTheDocument();
  });

  it('muestra mensaje si la lista está vacía', () => {
    render(<ObjetoLista objetos={[]} onSeleccionar={vi.fn()} />);
    expect(screen.getByText('No hay objetos que coincidan con los filtros.')).toBeInTheDocument();
  });

  it('renderiza objetos con el diseño de tienda: tipo, nombre, precio, descripción, ID, nivel y distintivo único', () => {
    const onSeleccionar = vi.fn();
    render(<ObjetoLista objetos={[objetoMock]} onSeleccionar={onSeleccionar} />);

    expect(screen.getByText('Arma')).toBeInTheDocument();
    expect(screen.getByText('Espada Mágica')).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
    expect(screen.getByText('Corta el aire con filo ardiente')).toBeInTheDocument();
    expect(screen.getByText(/Nivel 5/)).toBeInTheDocument();
    expect(screen.getByText('ID: #1')).toBeInTheDocument();
    expect(screen.getByText('Único')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Espada Mágica'));
    expect(onSeleccionar).toHaveBeenCalledWith(objetoMock);
  });

  it('permite editar y eliminar objetos libres', () => {
    const onEditar = vi.fn();
    const onEliminar = vi.fn();
    render(<ObjetoLista objetos={[objetoMock]} onSeleccionar={vi.fn()} onEditar={onEditar} onEliminar={onEliminar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(onEditar).toHaveBeenCalledWith(objetoMock);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onEliminar).toHaveBeenCalledWith(objetoMock);
  });

  it('oculta acciones cuando el objeto pertenece a un personaje', () => {
    render(<ObjetoLista objetos={[objetoPersonaje]} onSeleccionar={vi.fn()} onEditar={vi.fn()} onEliminar={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it('ordena y muestra los objetos en orden alfabético por nombre', () => {
    const objetoZ = { ...objetoMock, idObjeto: 10, nombre: 'Zafiro Arcano' };
    const objetoA = { ...objetoMock, idObjeto: 11, nombre: 'Anillo de Fuego' };
    const objetoM = { ...objetoMock, idObjeto: 12, nombre: 'Maza de Guerra' };

    render(<ObjetoLista objetos={[objetoZ, objetoA, objetoM]} onSeleccionar={vi.fn()} />);

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titulos).toEqual(['Anillo de Fuego', 'Maza de Guerra', 'Zafiro Arcano']);
  });
});
