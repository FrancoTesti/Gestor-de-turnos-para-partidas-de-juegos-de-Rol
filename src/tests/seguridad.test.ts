import { describe, expect, it, vi } from 'vitest';
import { hashPassword, verifyPassword } from '../security/password';
import { validarCompraObjeto, validarActualizacionObjeto } from '../validators/objeto.validator';
import { rangoVenta } from '../services/venta.rules';
import { inventorySchema, participationSchema, rewardSchema, saleSchema } from '../services/juego.service';
import { requireOwnedCharacterForCompra } from '../security/authorization';
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
  it('inhabilita a los anfitriones de poder comprar objetos en la tienda', async () => {
    const em = {} as any;
    const middleware = requireOwnedCharacterForCompra(em);
    const req = {
      identity: { idUsuario: 1, anfitrion: true, jugador: false },
      body: { idPersonaje: 1 },
      params: { id: '1' },
    } as any;
    const res = {} as any;
    let errorCapturado: any;
    const next = (err?: any) => { errorCapturado = err; };

    await middleware(req, res, next);
    expect(errorCapturado).toBeDefined();
    expect(errorCapturado.status).toBe(403);
    expect(errorCapturado.message).toBe('Los anfitriones no pueden comprar objetos de la tienda');
  });
  it('permite a un jugador continuar con la compra si es dueño del personaje', async () => {
    const personaje = { idPersonaje: 1, jugador: { usuario: { idUsuario: 2 } } };
    const em = {
      findOne: vi.fn().mockResolvedValue(personaje),
    } as any;
    const middleware = requireOwnedCharacterForCompra(em);
    const req = {
      identity: { idUsuario: 2, anfitrion: false, jugador: true },
      body: { idPersonaje: 1 },
      params: { id: '1' },
    } as any;
    const res = {} as any;
    let errorCapturado: any;
    let nextLlamado = false;
    const next = (err?: any) => {
      errorCapturado = err;
      if (!err) nextLlamado = true;
    };

    await middleware(req, res, next);
    expect(errorCapturado).toBeUndefined();
    expect(nextLlamado).toBe(true);
  });
});

