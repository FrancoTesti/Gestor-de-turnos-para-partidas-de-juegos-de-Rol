import { describe, expect, it } from 'vitest';
import { calcularValorPorNivel, INCREMENTO_VALOR_POR_NIVEL } from '../services/objeto.rules';

describe('objeto.rules - calcularValorPorNivel', () => {
  it('define un factor de incremento del 25%', () => {
    expect(INCREMENTO_VALOR_POR_NIVEL).toBe(0.25);
  });

  it('no modifica el valor si el nivel nuevo es igual o menor al anterior', () => {
    expect(calcularValorPorNivel(100, 1, 1)).toBe(100);
    expect(calcularValorPorNivel(100, 2, 3)).toBe(100);
  });

  it('aumenta el valor un 25% por cada nivel que sube', () => {
    // 1 nivel de diferencia: 100 * (1 + 0.25) = 125
    expect(calcularValorPorNivel(100, 2, 1)).toBe(125);
    // 2 niveles de diferencia: 100 * (1 + 0.50) = 150
    expect(calcularValorPorNivel(100, 3, 1)).toBe(150);
    // 4 niveles de diferencia: 40 * (1 + 1.00) = 80
    expect(calcularValorPorNivel(40, 5, 1)).toBe(80);
  });

  it('redondea enteros apropiadamente con Math.round', () => {
    // 35 * (1 + 0.25) = 43.75 -> 44
    expect(calcularValorPorNivel(35, 2, 1)).toBe(44);
  });
});
