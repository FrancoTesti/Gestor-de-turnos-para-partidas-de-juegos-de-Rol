import { describe, it, expect } from 'vitest';
import { ValidationError as HostValidationError, validatePayload } from '../shared/validate';
import { createHostSchema } from '../schemas/host.schema';
const validateCreateHost = (body: unknown) => validatePayload(createHostSchema, body);

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
