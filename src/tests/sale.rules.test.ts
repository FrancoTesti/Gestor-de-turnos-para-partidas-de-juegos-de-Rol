import { describe, expect, it } from 'vitest';
import { saleRange, SALE_MAX_PERCENTAGE, SALE_MIN_PERCENTAGE } from '../services/sale.rules';

describe('sale.rules - saleRange', () => {
  it('define porcentajes mínimo (70%) y máximo (100%)', () => {
    expect(SALE_MIN_PERCENTAGE).toBe(70);
    expect(SALE_MAX_PERCENTAGE).toBe(100);
  });

  it('calcula rangos exactos para múltiplos de 10', () => {
    const rango = saleRange(100);
    expect(rango.minimo).toBe(70);
    expect(rango.maximo).toBe(100);
  });

  it('aplica Math.ceil para el valor mínimo (70%) garantizando entero sin reducir de 70%', () => {
    // 70% de 45 es 31.5 -> Math.ceil(31.5) = 32
    const rango = saleRange(45);
    expect(rango.minimo).toBe(32);
    expect(rango.maximo).toBe(45);
  });

  it('aplica Math.floor para el valor máximo (100%)', () => {
    // 100% de 15 es 15
    const rango = saleRange(15);
    expect(rango.minimo).toBe(11); // 15 * 0.7 = 10.5 -> 11
    expect(rango.maximo).toBe(15);
  });

  it('maneja valores pequeños correctamente', () => {
    const rango = saleRange(1);
    expect(rango.minimo).toBe(1); // 1 * 0.7 = 0.7 -> 1
    expect(rango.maximo).toBe(1);
  });
});
