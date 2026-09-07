/* valida los datos de entrada para sesion.
Mismo patron que los otros validators del proyecto.
*/

import type { ActualizarSesionDTO, CrearSesionDTO, EstadoSesion } from '../types/sesion.dto';

// error personalizado para que el controller pueda distinguirlo de un error 500
export class ErrorValidacionSesion extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorValidacionSesion';
  }
}

// estados validos
const ESTADOS_VALIDOS: EstadoSesion[] = ['planificada', 'en_curso', 'finalizada'];

function esEstadoValido(valor: unknown): valor is EstadoSesion {
  return typeof valor === 'string' && ESTADOS_VALIDOS.includes(valor as EstadoSesion);
}

function esEnteroPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

// valida los datos para CREAR una sesion (todos obligatorios)
export function validarCreacionSesion(body: unknown): CrearSesionDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionSesion('El cuerpo de la petición debe ser un objeto JSON');
  }

  const b = body as Record<string, unknown>;

  if (!esEnteroPositivo(b.idPartida)) {
    throw new ErrorValidacionSesion('idPartida debe ser un entero positivo');
  }

  if (!esEnteroPositivo(b.numSesion)) {
    throw new ErrorValidacionSesion('numSesion debe ser un entero positivo');
  }

  if (!esEnteroPositivo(b.duracionSesion)) {
    throw new ErrorValidacionSesion('duracionSesion debe ser un entero positivo (minutos)');
  }

  if (!esEnteroPositivo(b.cantJugadores)) {
    throw new ErrorValidacionSesion('cantJugadores debe ser un entero positivo');
  }

  if (!esEstadoValido(b.estado)) {
    throw new ErrorValidacionSesion(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  return {
    idPartida: b.idPartida,
    numSesion: b.numSesion,
    duracionSesion: b.duracionSesion,
    cantJugadores: b.cantJugadores,
    estado: b.estado,
  };
}

// valida los datos para ACTUALIZAR una sesion (todos opcionales, pero si vienen deben ser válidos)
export function validarActualizacionSesion(body: unknown): ActualizarSesionDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionSesion('El cuerpo de la petición debe ser un objeto JSON');
  }

  const b = body as Record<string, unknown>;
  const resultado: ActualizarSesionDTO = {};

  if (b.duracionSesion !== undefined) {
    if (!esEnteroPositivo(b.duracionSesion)) {
      throw new ErrorValidacionSesion('duracionSesion debe ser un entero positivo');
    }
    resultado.duracionSesion = b.duracionSesion;
  }

  if (b.cantJugadores !== undefined) {
    if (!esEnteroPositivo(b.cantJugadores)) {
      throw new ErrorValidacionSesion('cantJugadores debe ser un entero positivo');
    }
    resultado.cantJugadores = b.cantJugadores;
  }

  if (b.estado !== undefined) {
    if (!esEstadoValido(b.estado)) {
      throw new ErrorValidacionSesion(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    resultado.estado = b.estado;
  }

  // no se permite enviar un body vacio en una actualización
  if (Object.keys(resultado).length === 0) {
    throw new ErrorValidacionSesion('Debe enviar al menos un campo para actualizar');
  }

  return resultado;
}