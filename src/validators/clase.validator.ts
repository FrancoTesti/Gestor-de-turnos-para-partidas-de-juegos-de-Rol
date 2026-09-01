import type { ActualizarClaseDTO, CrearClaseDTO } from '../types/clase.dto';

export class ErrorValidacionClase extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionClase';
  }
}

export function validarCreacionClase(body: unknown): CrearClaseDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionClase('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.nombreClase !== 'string' || payload.nombreClase.trim() === '') {
    throw new ErrorValidacionClase('El campo nombreClase es obligatorio');
  }

  if (typeof payload.descripcionClase !== 'string' || payload.descripcionClase.trim() === '') {
    throw new ErrorValidacionClase('El campo descripcionClase es obligatorio');
  }

  return {
    nombreClase: payload.nombreClase.trim(),
    descripcionClase: payload.descripcionClase.trim(),
  };
}

export function validarActualizacionClase(body: unknown): ActualizarClaseDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionClase('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const resultado: ActualizarClaseDTO = {};

  if (payload.nombreClase !== undefined) {
    if (typeof payload.nombreClase !== 'string' || payload.nombreClase.trim() === '') {
      throw new ErrorValidacionClase('El campo nombreClase no puede estar vacío');
    }
    resultado.nombreClase = payload.nombreClase.trim();
  }

  if (payload.descripcionClase !== undefined) {
    if (typeof payload.descripcionClase !== 'string' || payload.descripcionClase.trim() === '') {
      throw new ErrorValidacionClase('El campo descripcionClase no puede estar vacío');
    }
    resultado.descripcionClase = payload.descripcionClase.trim();
  }

  return resultado;
}
