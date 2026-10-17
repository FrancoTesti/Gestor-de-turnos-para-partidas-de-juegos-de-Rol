import type { ActualizarJugadorDTO, CrearJugadorDTO } from '../types/player.dto';

export class PlayerValidationError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'PlayerValidationError';
  }
}
export const ErrorValidacionJugador = PlayerValidationError;

// valida los datos para CREAR un Jugador
export function validateCreatePlayer(body: unknown): CrearJugadorDTO {
  // verifico que sea un objeto y no null, un array, etc.
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionJugador('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  // idUsuario debe ser un número entero positivo
  if (typeof payload.idUsuario !== 'number' || !Number.isInteger(payload.idUsuario) || payload.idUsuario <= 0) {
    throw new ErrorValidacionJugador('El campo idUsuario debe ser un número entero positivo');
  }

  // estado debe ser un booleano (true o false)
  if (typeof payload.estado !== 'boolean') {
    throw new ErrorValidacionJugador('El campo estado debe ser true o false');
  }

  return {
    idUsuario: payload.idUsuario,
    estado: payload.estado,
  };
}

// valida los datos para ACTUALIZAR un Jugador (solo el estado)
export function validateUpdatePlayer(body: unknown): ActualizarJugadorDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionJugador('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const resultado: ActualizarJugadorDTO = {};

  /* Si mandaron el campo estado, lo valido. Si no lo mandaron, no lo incluyo 
   en el resultado (Partial hace que sea opcional) */
  if (payload.estado !== undefined) {
    if (typeof payload.estado !== 'boolean') {
      throw new ErrorValidacionJugador('El campo estado debe ser true o false');
    }
    resultado.estado = payload.estado;
  }

  // no tiene sentido ni mucho menos logica un PUT vacío
  if (Object.keys(resultado).length === 0) {
    throw new ErrorValidacionJugador('Debe enviar al menos un campo para actualizar');
  }

  return resultado;
}

export const validarCreacionJugador = validateCreatePlayer;
export const validarActualizacionJugador = validateUpdatePlayer;