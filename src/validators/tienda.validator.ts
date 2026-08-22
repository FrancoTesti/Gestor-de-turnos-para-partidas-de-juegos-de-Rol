import type { ActualizarTiendaDTO, CrearTiendaDTO } from '../types/tienda.dto';

export class ErrorValidacionTienda extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionTienda';
  }
}

export function validarCreacionTienda(body: unknown): CrearTiendaDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionTienda('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
    throw new ErrorValidacionTienda('El campo nombre es obligatorio');
  }

  if (typeof payload.claseTienda !== 'string' || payload.claseTienda.trim() === '') {
    throw new ErrorValidacionTienda('El campo claseTienda es obligatorio');
  }

  let idClase: number | null = null;
  if (payload.idClase !== undefined && payload.idClase !== null) {
    const parsed = Number(payload.idClase);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new ErrorValidacionTienda('El campo idClase debe ser un entero mayor a 0 o null');
    }
    idClase = parsed;
  }

  return {
    nombre: payload.nombre.trim(),
    claseTienda: payload.claseTienda.trim(),
    idClase,
  };
}

export function validarActualizacionTienda(body: unknown): ActualizarTiendaDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionTienda('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const resultado: ActualizarTiendaDTO = {};

  if (payload.nombre !== undefined) {
    if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
      throw new ErrorValidacionTienda('El campo nombre no puede estar vacío');
    }
    resultado.nombre = payload.nombre.trim();
  }

  if (payload.claseTienda !== undefined) {
    if (typeof payload.claseTienda !== 'string' || payload.claseTienda.trim() === '') {
      throw new ErrorValidacionTienda('El campo claseTienda no puede estar vacío');
    }
    resultado.claseTienda = payload.claseTienda.trim();
  }

  if (payload.idClase !== undefined) {
    resultado.idClase = payload.idClase !== null ? Number(payload.idClase) : null;
  }

  return resultado;
}
