import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading Component', () => {
  it('debe renderizar el spinner de carga', () => {
    const { container } = render(<Loading message="Cargando..." />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('debe tener la clase loading correcta', () => {
    const { container } = render(<Loading message="Por favor espera" />);

    expect(container.querySelector('.loading-container')).toBeInTheDocument();
  });

  it('debe renderizar mensaje personalizado', () => {
    render(<Loading message="Guardando usuario..." />);

    expect(screen.getByText('Guardando usuario...')).toBeInTheDocument();
  });
});
