import { describe, it, expect } from 'vitest';
import { HostValidationError, validateCreateHost } from '../validators/host.validator';

describe('host.validator', () => {
  it('completa con 0 los campos opcionales al crear', () => {
    expect(validateCreateHost({ idUsuario: 5 })).toEqual({
      idUsuario: 5,
      cantPartidasActuales: 0,
      karma: 0,
    });
  });

  it('rechaza karma inválido cuando se envía explícitamente', () => {
    expect(() => validateCreateHost({ idUsuario: 5, karma: -1 })).toThrow(HostValidationError);
  });
});
