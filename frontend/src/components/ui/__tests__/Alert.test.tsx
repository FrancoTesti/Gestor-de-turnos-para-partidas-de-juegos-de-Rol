import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Alert from '../Alert';

describe('Alert Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('debe renderizar mensaje de éxito', () => {
    render(
      <Alert type="success" message="Usuario creado exitosamente" onClose={() => {}} />
    );

    expect(screen.getByText('Usuario creado exitosamente')).toBeInTheDocument();
  });

  it('debe renderizar mensaje de error', () => {
    render(
      <Alert type="error" message="Error al crear usuario" onClose={() => {}} />
    );

    expect(screen.getByText('Error al crear usuario')).toBeInTheDocument();
  });

  it('debe llamar a onClose después de 3 segundos', () => {
    const mockOnClose = vi.fn();

    render(
      <Alert type="success" message="Test" onClose={mockOnClose} />
    );

    // Avanza 3 segundos
    vi.advanceTimersByTime(3000);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('debe tener el tipo correcto en la clase CSS', () => {
    const { container } = render(
      <Alert type="warning" message="Advertencia" onClose={() => {}} />
    );

    const alertDiv = container.querySelector('.alert');
    expect(alertDiv).toHaveClass('alert-warning');
  });
});
