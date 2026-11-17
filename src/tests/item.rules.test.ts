import { describe, expect, it } from 'vitest';
import { calculateValueByLevel, VALUE_INCREASE_PER_LEVEL } from '../services/item.rules';

describe('item.rules - calculateValueByLevel', () => {
  it('define un factor de incremento del 25%', () => {
    expect(VALUE_INCREASE_PER_LEVEL).toBe(0.25);
  });

  it('no modifica el valor si el nivel nuevo es igual o menor al anterior', () => {
    expect(calculateValueByLevel(100, 1, 1)).toBe(100);
    expect(calculateValueByLevel(100, 2, 3)).toBe(100);
  });

  it('aumenta el valor un 25% por cada nivel que sube', () => {
    // 1 nivel de diferencia: 100 * (1 + 0.25) = 125
    expect(calculateValueByLevel(100, 2, 1)).toBe(125);
    // 2 niveles de diferencia: 100 * (1 + 0.50) = 150
    expect(calculateValueByLevel(100, 3, 1)).toBe(150);
    // 4 niveles de diferencia: 40 * (1 + 1.00) = 80
    expect(calculateValueByLevel(40, 5, 1)).toBe(80);
  });

  it('redondea enteros apropiadamente con Math.round', () => {
    // 35 * (1 + 0.25) = 43.75 -> 44
    expect(calculateValueByLevel(35, 2, 1)).toBe(44);
  });
});
