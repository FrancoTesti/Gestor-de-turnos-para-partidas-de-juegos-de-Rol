import { describe, it, expect } from 'vitest';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/usuario.schema';

describe('Zod Validation Schemas - Usuario', () => {
  describe('crearUsuarioSchema', () => {
    it('debe validar un objeto de creación correcto', () => {
      const valido = {
        nombreUsuario: 'Juan Perez',
        nickname: 'jperez',
        contrasena: 'password123',
        imagen: 'avatar.png',
      };
      const resultado = crearUsuarioSchema.safeParse(valido);
      expect(resultado.success).toBe(true);
    });

    it('debe rechazar la presencia de idUsuario en el body gracias a .strict()', () => {
      const conId = {
        idUsuario: 99,
        nombreUsuario: 'Juan Perez',
        nickname: 'jperez',
        contrasena: 'password123',
      };
      const resultado = crearUsuarioSchema.safeParse(conId);
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].code).toBe('unrecognized_keys');
      }
    });

    it('debe rechazar campos obligatorios faltantes', () => {
      const incompleto = {
        nombreUsuario: 'Juan Perez',
      };
      const resultado = crearUsuarioSchema.safeParse(incompleto);
      expect(resultado.success).toBe(false);
    });
  });

  describe('actualizarUsuarioSchema', () => {
    it('debe aceptar una actualización válida con un solo campo', () => {
      const valido = { nickname: 'nuevoNick' };
      const resultado = actualizarUsuarioSchema.safeParse(valido);
      expect(resultado.success).toBe(true);
    });

    it('debe rechazar una actualización vacía {}', () => {
      const vacio = {};
      const resultado = actualizarUsuarioSchema.safeParse(vacio);
      expect(resultado.success).toBe(false);
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe('Debe enviar al menos un campo para actualizar');
      }
    });

    it('debe rechazar si se intenta enviar idUsuario en la actualización', () => {
      const conId = { idUsuario: 5, nickname: 'nuevoNick' };
      const resultado = actualizarUsuarioSchema.safeParse(conId);
      expect(resultado.success).toBe(false);
    });
  });
});
