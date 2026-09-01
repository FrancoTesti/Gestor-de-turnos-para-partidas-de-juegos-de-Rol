import { describe, it, expect } from 'vitest';
import {
  validarCreacionUsuario,
  validarActualizacionUsuario,
  ErrorValidacionUsuario,
} from '../validators/usuario.validator';

describe('usuario.validator tests (usando Zod internamente)', () => {
  describe('validarCreacionUsuario', () => {
    it('debe retornar un DTO válido cuando los datos son correctos', () => {
      const entrada = {
        nombreUsuario: 'Juan Perez',
        nickname: 'jperez',
        contrasena: 'password123',
        imagen: 'avatar.png',
      };
      const dto = validarCreacionUsuario(entrada);
      expect(dto).toEqual({
        nombreUsuario: 'Juan Perez',
        nickname: 'jperez',
        contrasena: 'password123',
        imagen: 'avatar.png',
      });
    });

    it('debe lanzar ErrorValidacionUsuario si faltan campos obligatorios', () => {
      const entrada = {
        nombreUsuario: 'Juan Perez',
      };
      expect(() => validarCreacionUsuario(entrada)).toThrow(ErrorValidacionUsuario);
    });

    it('debe lanzar ErrorValidacionUsuario si incluye idUsuario u otros campos extra (.strict)', () => {
      const entrada = {
        idUsuario: 1,
        nombreUsuario: 'Juan Perez',
        nickname: 'jperez',
        contrasena: 'password123',
      };
      expect(() => validarCreacionUsuario(entrada)).toThrow(ErrorValidacionUsuario);
    });
  });

  describe('validarActualizacionUsuario', () => {
    it('debe retornar DTO parcial válido cuando se envía un campo', () => {
      const entrada = { nickname: 'nuevoNick' };
      const dto = validarActualizacionUsuario(entrada);
      expect(dto).toEqual({ nickname: 'nuevoNick' });
    });

    it('debe lanzar ErrorValidacionUsuario si el objeto de actualización está vacío', () => {
      expect(() => validarActualizacionUsuario({})).toThrow(ErrorValidacionUsuario);
    });

    it('debe lanzar ErrorValidacionUsuario si se intenta enviar idUsuario en la actualización', () => {
      const entrada = { idUsuario: 1, nickname: 'nuevoNick' };
      expect(() => validarActualizacionUsuario(entrada)).toThrow(ErrorValidacionUsuario);
    });
  });
});
