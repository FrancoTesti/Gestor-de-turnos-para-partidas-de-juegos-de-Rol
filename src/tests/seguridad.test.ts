import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../security/password';
import { validarCompraObjeto, validarActualizacionObjeto } from '../validators/objeto.validator';
import { rangoVenta } from '../services/venta.rules';
import { inventorySchema, participationSchema, rewardSchema, saleSchema } from '../services/juego.service';
describe('contratos y seguridad', () => {
  it('hash con sal distinta, conserva espacios y cabe en columna actual', async () => {
    const first = await hashPassword(' clave123 '); const second = await hashPassword(' clave123 ');
    expect(first).not.toBe(second); expect(first).toHaveLength(99);
    expect(await verifyPassword(' clave123 ', first)).toBe(true);
    expect(await verifyPassword('clave123', first)).toBe(false);
    expect(await verifyPassword('clave123', 'clave123')).toBe(false);
  });
  it.each([true, null, '', '1', 1.5, -1, Infinity, NaN, 2147483648])('rechaza valor no válido %s en compra', valor => {
    expect(() => validarCompraObjeto({ idPersonaje: valor, numInventario: 1, posicion: 0 })).toThrow();
    expect(() => validarCompraObjeto({ idPersonaje: 1, numInventario: valor, posicion: 0 })).toThrow();
    expect(() => validarCompraObjeto({ idPersonaje: 1, numInventario: 1, posicion: valor })).toThrow();
  });
  it('valida actualización de referencia, precio entero y campos desconocidos', () => {
    expect(() => validarActualizacionObjeto({ idTienda: true })).toThrow();
    expect(() => validarActualizacionObjeto({ valor: 1.5 })).toThrow();
    expect(() => validarActualizacionObjeto({ idPersonaje: 1 })).toThrow();
    expect(() => validarActualizacionObjeto({})).toThrow();
  });
  it('redondea límites sin salir del rango 70–100 %', () => {
    expect(rangoVenta(40)).toEqual({ minimo: 28, maximo: 40 });
    expect(rangoVenta(3)).toEqual({ minimo: 3, maximo: 3 });
    expect(rangoVenta(0)).toEqual({ minimo: 0, maximo: 0 });
    expect(saleSchema.safeParse({ idPersonaje: 1, idTienda: 1, precio: -1 }).success).toBe(false);
  });
  it('no admite inventarios ilimitados ni participantes/recompensas repetidos', () => {
    expect(inventorySchema.safeParse({ idPersonaje: 1, numInventario: 1, cantidadEspacio: 1001 }).success).toBe(false);
    expect(participationSchema.safeParse({ idPersonajes: [1, 1] }).success).toBe(false);
    expect(rewardSchema.safeParse({ recompensas: [{ idPersonaje: 1, xp: 1, dinero: 1 }, { idPersonaje: 1, xp: 1, dinero: 1 }] }).success).toBe(false);
  });
});
