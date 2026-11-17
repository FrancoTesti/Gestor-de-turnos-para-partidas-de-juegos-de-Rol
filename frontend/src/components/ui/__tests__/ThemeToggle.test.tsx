import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../../context/ThemeContext';

describe('ThemeToggle', () => {
  it('renderiza el botón y alterna el tema al hacer click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showLabel />
      </ThemeProvider>
    );

    const btn = screen.getByRole('button', { name: /cambiar tema visual/i });
    expect(btn).toBeInTheDocument();
    expect(screen.getByText('Modo Claro')).toBeInTheDocument();

    fireEvent.click(btn);
    expect(screen.getByText('Modo Oscuro')).toBeInTheDocument();
  });
});
