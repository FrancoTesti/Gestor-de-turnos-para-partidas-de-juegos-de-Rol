import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AvisoModal from '../AvisoModal';

describe('AvisoModal', () => {
  it('no renderiza nada si mensaje está vacío', () => {
    const { container } = render(<AvisoModal mensaje="" onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <AvisoModal isOpen={false} mensaje="Error de prueba" onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza título por defecto y mensaje si solo se pasa mensaje', () => {
    render(<AvisoModal mensaje="Mensaje de prueba" onClose={() => {}} />);
    expect(screen.getByText('Aviso del Sistema')).toBeInTheDocument();
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entendido' })).toBeInTheDocument();
  });

  it('cierra al hacer click en el botón "Entendido" usando onClose', () => {
    const onClose = vi.fn();
    render(<AvisoModal mensaje="Prueba error" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer click en el botón "Entendido" usando onCerrar', () => {
    const onCerrar = vi.fn();
    render(<AvisoModal mensaje="Prueba error" onCerrar={onCerrar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer click en el botón de la cruz (✕)', () => {
    const onClose = vi.fn();
    render(<AvisoModal mensaje="Prueba error" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra al hacer click en el overlay backdrop', () => {
    const onClose = vi.fn();
    render(<AvisoModal mensaje="Prueba error" onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no cierra si se hace click dentro del contenido del modal', () => {
    const onClose = vi.fn();
    render(<AvisoModal mensaje="Prueba error" onClose={onClose} />);
    const contenido = screen.getByText('Prueba error');
    fireEvent.click(contenido);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cierra al presionar la tecla Escape', () => {
    const onClose = vi.fn();
    render(<AvisoModal mensaje="Prueba error" onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
