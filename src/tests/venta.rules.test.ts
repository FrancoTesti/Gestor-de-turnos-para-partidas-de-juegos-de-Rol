import { describe, expect, it } from 'vitest';
import { rangoVenta, VENTA_MAX_PORCENTAJE, VENTA_MIN_PORCENTAJE } from '../services/venta.rules';

describe('venta.rules - rangoVenta', () => {
  it('define porcentajes mínimo (50%) y máximo (80%)', () => {
    expect(VENTA_MIN_PORCENTAJE).toBe(50);
    expect(VENTA_MAX_PORCENTAJE).toBe(80);
  });

  it('calcula rangos exactos para múltiplos de 10', () => {
    const rango = rangoVenta(100);
    expect(rango.minimo).toBe(50);
    expect(rango.maximo).toBe(80);
  });

  it('aplica Math.ceil para el valor mínimo (50%) garantizando entero sin reducir de 50%', () => {
    // 50% de 45 es 22.5 -> Math.ceil(22.5) = 23
    const rango = rangoVenta(45);
    expect(rango.minimo).toBe(23);
    expect(rango.maximo).toBe(36);
  });

  it('aplica Math.floor para el valor máximo (80%)', () => {
    // 80% de 15 es 12
    const rango = rangoVenta(15);
    expect(rango.minimo).toBe(8); // 15 * 0.5 = 7.5 -> 8
    expect(rango.maximo).toBe(12);
  });

  it('maneja valores pequeños correctamente', () => {
    const rango = rangoVenta(1);
    expect(rango.minimo).toBe(1); // 1 * 0.5 = 0.5 -> 1
    expect(rango.maximo).toBe(1);
  });
});
