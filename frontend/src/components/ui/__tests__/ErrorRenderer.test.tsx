import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  classifyError,
  ErrorBanner,
  renderAppError,
  renderAuthError,
  renderConflictError,
  renderNotFoundError,
  renderServerError,
  renderValidationError,
} from '../ErrorRenderer';

describe('ErrorRenderer', () => {
  it('clasifica errores de validación, conflicto, no encontrado, permisos y red', () => {
    expect(classifyError({ status: 400, message: 'El nombre es obligatorio' }).category).toBe('validation');
    expect(classifyError('El precio debe ser positivo').category).toBe('validation');
    expect(classifyError('Ya existe una clase con ese nombre').category).toBe('conflict');
    expect(classifyError('Personaje no encontrado').category).toBe('not_found');
    expect(classifyError('Solo el anfitrión propietario puede editar').category).toBe('auth');
    expect(classifyError('No se pudo conectar con el servidor').category).toBe('network');
    expect(classifyError(new Error('Fallo interno inesperado')).category).toBe('server');
  });

  it('renderiza cada tipo de error con sus funciones específicas y con ErrorBanner', () => {
    const { rerender } = render(<>{renderValidationError('Dato inválido')}</>);
    expect(screen.getByText('Dato inválido')).toBeInTheDocument();

    rerender(<>{renderConflictError('Conflicto de estado')}</>);
    expect(screen.getByText('Conflicto de estado')).toBeInTheDocument();

    rerender(<>{renderNotFoundError('No existe el recurso')}</>);
    expect(screen.getByText('No existe el recurso')).toBeInTheDocument();

    rerender(<>{renderAuthError('Sin permisos')}</>);
    expect(screen.getByText('Sin permisos')).toBeInTheDocument();

    rerender(<>{renderServerError('Error grave')}</>);
    expect(screen.getByText('Error grave')).toBeInTheDocument();

    rerender(<>{renderAppError(null)}</>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<ErrorBanner error="El campo nombre es obligatorio" />);
    expect(screen.getByText('El campo nombre es obligatorio')).toBeInTheDocument();
  });
});
