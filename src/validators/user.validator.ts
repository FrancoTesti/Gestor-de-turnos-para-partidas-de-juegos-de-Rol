import type { ActualizarUsuarioDTO, CrearUsuarioDTO } from '../types/user.dto';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/user.schema';

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationError';
  }
}
export const ErrorValidacionUsuario = UserValidationError;

export { crearUsuarioSchema, actualizarUsuarioSchema };

export function validateCreateUser(data: unknown): CrearUsuarioDTO {
  const resultado = crearUsuarioSchema.safeParse(data);
  if (!resultado.success) {
    const primerError = resultado.error.issues[0]?.message || 'Datos de creación de usuario inválidos';
    throw new ErrorValidacionUsuario(primerError);
  }
  return resultado.data as CrearUsuarioDTO;
}

export function validateUpdateUser(data: unknown): ActualizarUsuarioDTO {
  const resultado = actualizarUsuarioSchema.safeParse(data);
  if (!resultado.success) {
    const primerError = resultado.error.issues[0]?.message || 'Datos de actualización de usuario inválidos';
    throw new ErrorValidacionUsuario(primerError);
  }
  return resultado.data as ActualizarUsuarioDTO;
}

export const validarCreacionUsuario = validateCreateUser;
export const validarActualizacionUsuario = validateUpdateUser;
