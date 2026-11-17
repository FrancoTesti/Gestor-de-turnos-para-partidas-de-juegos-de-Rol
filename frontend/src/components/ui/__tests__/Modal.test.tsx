import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';
import { vi } from 'vitest';

describe('Modal Component', () => {
  it('debe renderizar el modal cuando isOpen es true', () => {
    render(
      <Modal
        isOpen={true}
        title="Confirmar Acción"
        message="¿Estás seguro?"
        confirmText="Sí"
        cancelText="No"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText('Confirmar Acción')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
  });

  it('no debe renderizar el modal cuando isOpen es false', () => {
    const { container } = render(
      <Modal
        isOpen={false}
        title="Confirmar"
        message="¿Seguro?"
        confirmText="Sí"
        cancelText="No"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });

  it('debe llamar onConfirm cuando click en botón confirmar', () => {
    const mockConfirm = vi.fn();

    render(
      <Modal
        isOpen={true}
        title="Eliminar"
        message="¿Continuar?"
        confirmText="Aceptar"
        cancelText="Cancelar"
        onConfirm={mockConfirm}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Aceptar'));
    expect(mockConfirm).toHaveBeenCalled();
  });

  it('debe llamar onCancel cuando click en botón cancelar', () => {
    const mockCancel = vi.fn();

    render(
      <Modal
        isOpen={true}
        title="Eliminar"
        message="¿Continuar?"
        confirmText="Sí"
        cancelText="No"
        onConfirm={() => {}}
        onCancel={mockCancel}
      />
    );

    fireEvent.click(screen.getByText('No'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
