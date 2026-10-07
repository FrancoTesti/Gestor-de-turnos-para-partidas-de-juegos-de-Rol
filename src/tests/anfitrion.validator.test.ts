import { describe, it, expect } from 'vitest';
import { ErrorValidacionAnfitrion, validarCreacionAnfitrion } from '../validators/anfitrion.validator';

describe('anfitrion.validator', () => {
  it('completa con 0 los campos opcionales al crear', () => {
    expect(validarCreacionAnfitrion({ idUsuario: 5 })).toEqual({
      idUsuario: 5,
      cantPartidasActuales: 0,
      karma: 0,
    });
  });

  it('rechaza karma inválido cuando se envía explícitamente', () => {
    expect(() => validarCreacionAnfitrion({ idUsuario: 5, karma: -1 })).toThrow(ErrorValidacionAnfitrion);
  });
});
