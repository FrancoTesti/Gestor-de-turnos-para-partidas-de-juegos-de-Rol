import type { ActualizarUsuarioDTO, CrearUsuarioDTO } from '../types/usuario.dto';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/usuario.schema';

export class ErrorValidacionUsuario extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorValidacionUsuario';
  }
}

export { crearUsuarioSchema, actualizarUsuarioSchema };

export function validarCreacionUsuario(data: unknown): CrearUsuarioDTO {
  const resultado = crearUsuarioSchema.safeParse(data);
  if (!resultado.success) {
    const primerError = resultado.error.issues[0]?.message || 'Datos de creación de usuario inválidos';
    throw new ErrorValidacionUsuario(primerError);
  }
  return resultado.data as CrearUsuarioDTO;
}

export function validarActualizacionUsuario(data: unknown): ActualizarUsuarioDTO {
  const resultado = actualizarUsuarioSchema.safeParse(data);
  if (!resultado.success) {
    const primerError = resultado.error.issues[0]?.message || 'Datos de actualización de usuario inválidos';
    throw new ErrorValidacionUsuario(primerError);
  }
  return resultado.data as ActualizarUsuarioDTO;
}
