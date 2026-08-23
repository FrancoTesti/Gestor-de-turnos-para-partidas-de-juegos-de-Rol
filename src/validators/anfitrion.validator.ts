// para las operaciones de Anfitrion antes de pasarlos al service.
import type { ActualizarAnfitrionDTO, CrearAnfitrionDTO } from '../types/anfitrion.dto';

// Error error para distinguirlo de otros en el controller
export class ErrorValidacionAnfitrion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionAnfitrion';
  }
}

// valida los datos para CREAR un Anfitrion
export function validarCreacionAnfitrion(body: unknown): CrearAnfitrionDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionAnfitrion('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  // idUsuario debe ser un número entero positivo
  if (typeof payload.idUsuario !== 'number' || !Number.isInteger(payload.idUsuario) || payload.idUsuario <= 0) {
    throw new ErrorValidacionAnfitrion('El campo idUsuario debe ser un número entero positivo');
  }

  // cantPartidasActuales debe ser un número entero >= 0
  if (
    typeof payload.cantPartidasActuales !== 'number' ||
    !Number.isInteger(payload.cantPartidasActuales) ||
    payload.cantPartidasActuales < 0
  ) {
    throw new ErrorValidacionAnfitrion('El campo cantPartidasActuales debe ser un número entero mayor o igual a 0');
  }

  // karma debe ser un número entero >= 0
  if (
    typeof payload.karma !== 'number' ||
    !Number.isInteger(payload.karma) ||
    payload.karma < 0
  ) {
    throw new ErrorValidacionAnfitrion('El campo karma debe ser un número entero mayor o igual a 0');
  }

  return {
    idUsuario: payload.idUsuario,
    cantPartidasActuales: payload.cantPartidasActuales,
    karma: payload.karma,
  };
}

// valida los datos para ACTUALIZAR un Anfitrion
export function validarActualizacionAnfitrion(body: unknown): ActualizarAnfitrionDTO {
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