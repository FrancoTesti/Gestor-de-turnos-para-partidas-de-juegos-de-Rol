import type { ActualizarPersonajeDTO, CrearPersonajeDTO } from '../types/personaje.dto';

export class ErrorValidacionPersonaje extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorValidacionPersonaje';
  }
}

function obtenerObjeto(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ErrorValidacionPersonaje('El cuerpo de la solicitud debe ser un objeto JSON');
  }
  return data as Record<string, unknown>;
}

function validarTexto(valor: unknown, campo: string, minLength = 1, maxLength = 100): string {
  if (typeof valor !== 'string') {
    throw new ErrorValidacionPersonaje(`El campo '${campo}' debe ser un texto`);
  }
  const texto = valor.trim();
  if (texto.length < minLength) {
    throw new ErrorValidacionPersonaje(`El campo '${campo}' no puede estar vacío`);
  }
  if (texto.length > maxLength) {
    throw new ErrorValidacionPersonaje(`El campo '${campo}' supera el máximo de ${maxLength} caracteres`);
  }
  return texto;
}

function validarNumeroPositivo(valor: unknown, campo: string, min = 1): number {
  const num = Number(valor);
  if (!Number.isFinite(num) || num < min) {
    throw new ErrorValidacionPersonaje(`El campo '${campo}' debe ser un número entero mayor o igual a ${min}`);
  }
  return num;
}

export function validarCreacionPersonaje(body: unknown): CrearPersonajeDTO {
  const data = obtenerObjeto(body);

  if (!data.nombreFicticio) {
    throw new ErrorValidacionPersonaje('El campo nombreFicticio es obligatorio');
  }
  if (!data.raza) {
    throw new ErrorValidacionPersonaje('El campo raza es obligatorio');
  }
  if (data.idClase === undefined || data.idClase === null) {
    throw new ErrorValidacionPersonaje('El campo idClase es obligatorio');
  }
  if (data.idUsuarioJugador === undefined || data.idUsuarioJugador === null) {
    throw new ErrorValidacionPersonaje('El campo idUsuarioJugador es obligatorio');
  }
  if (data.idPartida === undefined || data.idPartida === null) {
    throw new ErrorValidacionPersonaje('El campo idPartida es obligatorio');
  }

  const dto: CrearPersonajeDTO = {
    nombreFicticio: validarTexto(data.nombreFicticio, 'nombreFicticio', 1, 100),
    raza: validarTexto(data.raza, 'raza', 1, 50),
    idClase: validarNumeroPositivo(data.idClase, 'idClase', 1),
    idUsuarioJugador: validarNumeroPositivo(data.idUsuarioJugador, 'idUsuarioJugador', 1),
    idPartida: validarNumeroPositivo(data.idPartida, 'idPartida', 1),
  };

  if (data.xp !== undefined && data.xp !== null) {
    dto.xp = validarNumeroPositivo(data.xp, 'xp', 0);
  }
  if (data.nivel !== undefined && data.nivel !== null) {
    dto.nivel = validarNumeroPositivo(data.nivel, 'nivel', 1);
  }
  if (data.dinero !== undefined && data.dinero !== null) {
    dto.dinero = validarNumeroPositivo(data.dinero, 'dinero', 0);
  }

  return dto;
}

export function validarActualizacionPersonaje(body: unknown): ActualizarPersonajeDTO {
  const data = obtenerObjeto(body);
  const dto: ActualizarPersonajeDTO = {};

  if (Object.keys(data).length === 0) {
    throw new ErrorValidacionPersonaje('Debe enviar al menos un campo para actualizar');
  }

  if (data.nombreFicticio !== undefined) {
    dto.nombreFicticio = validarTexto(data.nombreFicticio, 'nombreFicticio', 1, 100);
  }
  if (data.raza !== undefined) {
    dto.raza = validarTexto(data.raza, 'raza', 1, 50);
  }
  if (data.idClase !== undefined) {
    dto.idClase = validarNumeroPositivo(data.idClase, 'idClase', 1);
  }
  if (data.idUsuarioJugador !== undefined) {
    dto.idUsuarioJugador = validarNumeroPositivo(data.idUsuarioJugador, 'idUsuarioJugador', 1);
  }
  if (data.idPartida !== undefined) {
    dto.idPartida = validarNumeroPositivo(data.idPartida, 'idPartida', 1);
  }
  if (data.xp !== undefined) {
    dto.xp = validarNumeroPositivo(data.xp, 'xp', 0);
  }
  if (data.nivel !== undefined) {
    dto.nivel = validarNumeroPositivo(data.nivel, 'nivel', 1);
  }
  if (data.dinero !== undefined) {
    dto.dinero = validarNumeroPositivo(data.dinero, 'dinero', 0);
  }

  return dto;
}
