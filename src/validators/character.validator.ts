import type { ActualizarPersonajeDTO, CrearPersonajeDTO } from '../types/character.dto';

export class CharacterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CharacterValidationError';
  }
}
export const ErrorValidacionPersonaje = CharacterValidationError;

function getObject(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ErrorValidacionPersonaje('El cuerpo de la solicitud debe ser un objeto JSON');
  }
  return data as Record<string, unknown>;
}

function validateText(valor: unknown, campo: string, minLength = 1, maxLength = 100): string {
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

function validatePositiveNumber(valor: unknown, campo: string, min = 1): number {
  const num = valor;
  if (typeof num !== 'number' || !Number.isSafeInteger(num) || num < min || num > 2147483647) {
    throw new ErrorValidacionPersonaje(`El campo '${campo}' debe ser un número entero mayor o igual a ${min}`);
  }
  return num;
}

export function validateCreateCharacter(body: unknown): CrearPersonajeDTO {
  const data = getObject(body);

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
    nombreFicticio: validateText(data.nombreFicticio, 'nombreFicticio', 1, 100),
    raza: validateText(data.raza, 'raza', 1, 50),
    idClase: validatePositiveNumber(data.idClase, 'idClase', 1),
    idUsuarioJugador: validatePositiveNumber(data.idUsuarioJugador, 'idUsuarioJugador', 1),
    idPartida: validatePositiveNumber(data.idPartida, 'idPartida', 1),
  };

  if (data.contrasenaPartida !== undefined) {
    if (typeof data.contrasenaPartida !== 'string' || data.contrasenaPartida.length > 100) throw new ErrorValidacionPersonaje('Contraseña de partida inválida');
    dto.contrasenaPartida = data.contrasenaPartida;
  }

  return dto;
}

export function validateUpdateCharacter(body: unknown): ActualizarPersonajeDTO {
  const data = getObject(body);
  const dto: ActualizarPersonajeDTO = {};

  if (Object.keys(data).length === 0) {
    throw new ErrorValidacionPersonaje('Debe enviar al menos un campo para actualizar');
  }

  if (data.nombreFicticio !== undefined) {
    dto.nombreFicticio = validateText(data.nombreFicticio, 'nombreFicticio', 1, 100);
  }
  if (data.raza !== undefined) {
    dto.raza = validateText(data.raza, 'raza', 1, 50);
  }
  if (data.idClase !== undefined) {
    dto.idClase = validatePositiveNumber(data.idClase, 'idClase', 1);
  }

  return dto;
}

export const validarCreacionPersonaje = validateCreateCharacter;
export const validarActualizacionPersonaje = validateUpdateCharacter;
