import type { ActualizarAnfitrionDTO, CrearAnfitrionDTO } from '../types/host.dto';

export class HostValidationError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'HostValidationError';
  }
}
export const ErrorValidacionAnfitrion = HostValidationError;

// valida los datos para CREAR un Anfitrion
export function validateCreateHost(body: unknown): CrearAnfitrionDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionAnfitrion('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  // idUsuario debe ser un número entero positivo
  if (typeof payload.idUsuario !== 'number' || !Number.isInteger(payload.idUsuario) || payload.idUsuario <= 0) {
    throw new ErrorValidacionAnfitrion('El campo idUsuario debe ser un número entero positivo');
  }

  const cantPartidasActuales = payload.cantPartidasActuales ?? 0;
  // cantPartidasActuales debe ser un número entero >= 0
  if (
    typeof cantPartidasActuales !== 'number' ||
    !Number.isInteger(cantPartidasActuales) ||
    cantPartidasActuales < 0
  ) {
    throw new ErrorValidacionAnfitrion('El campo cantPartidasActuales debe ser un número entero mayor o igual a 0');
  }

  const karma = payload.karma ?? 0;
  // karma debe ser un número entero >= 0
  if (
    typeof karma !== 'number' ||
    !Number.isInteger(karma) ||
    karma < 0
  ) {
    throw new ErrorValidacionAnfitrion('El campo karma debe ser un número entero mayor o igual a 0');
  }

  return {
    idUsuario: payload.idUsuario,
    cantPartidasActuales,
    karma,
  };
}

// valida los datos para ACTUALIZAR un Anfitrion
export function validateUpdateHost(body: unknown): ActualizarAnfitrionDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionAnfitrion('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const resultado: ActualizarAnfitrionDTO = {};

  if (payload.cantPartidasActuales !== undefined) {
    if (
      typeof payload.cantPartidasActuales !== 'number' ||
      !Number.isInteger(payload.cantPartidasActuales) ||
      payload.cantPartidasActuales < 0
    ) {
      throw new ErrorValidacionAnfitrion('El campo cantPartidasActuales debe ser un número entero mayor o igual a 0');
    }
    resultado.cantPartidasActuales = payload.cantPartidasActuales;
  }

  if (payload.karma !== undefined) {
    if (
      typeof payload.karma !== 'number' ||
      !Number.isInteger(payload.karma) ||
      payload.karma < 0
    ) {
      throw new ErrorValidacionAnfitrion('El campo karma debe ser un número entero mayor o igual a 0');
    }
    resultado.karma = payload.karma;
  }

  if (Object.keys(resultado).length === 0) {
    throw new ErrorValidacionAnfitrion('Debe enviar al menos un campo para actualizar');
  }

  return resultado;
}

export const validarCreacionAnfitrion = validateCreateHost;
export const validarActualizacionAnfitrion = validateUpdateHost;