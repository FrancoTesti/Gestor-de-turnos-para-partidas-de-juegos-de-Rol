import type { CrearAnfitrionDTO } from '../types/host.dto';

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

export const validarCreacionAnfitrion = validateCreateHost;
