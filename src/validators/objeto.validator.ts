import type { ActualizarObjetoDTO, ComprarObjetoDTO, CrearObjetoDTO } from '../types/objeto.dto';

export class ErrorValidacionObjeto extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionObjeto';
  }
}

export function validarCreacionObjeto(body: unknown): CrearObjetoDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionObjeto('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
    throw new ErrorValidacionObjeto('El campo nombre es obligatorio');
  }

  if (typeof payload.descripcion !== 'string' || payload.descripcion.trim() === '') {
    throw new ErrorValidacionObjeto('El campo descripcion es obligatorio');
  }

  if (typeof payload.tipoObjeto !== 'string' || payload.tipoObjeto.trim() === '') {
    throw new ErrorValidacionObjeto('El campo tipoObjeto es obligatorio');
  }

  const valor = Number(payload.valor);
  if (isNaN(valor) || valor < 0) {
    throw new ErrorValidacionObjeto('El campo valor debe ser un número mayor o igual a 0');
  }

  const nivelObjeto = Number(payload.nivelObjeto);
  if (isNaN(nivelObjeto) || nivelObjeto < 1) {
    throw new ErrorValidacionObjeto('El campo nivelObjeto debe ser un número mayor o igual a 1');
  }

  let idTienda: number | null = null;
  if (payload.idTienda !== undefined && payload.idTienda !== null) {
    const parsedId = Number(payload.idTienda);
    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
      throw new ErrorValidacionObjeto('El campo idTienda debe ser un entero mayor a 0 o null');
    }
    idTienda = parsedId;
  }

  let posicion = 0;
  if (payload.posicion !== undefined) {
    const parsedPos = Number(payload.posicion);
    if (!Number.isSafeInteger(parsedPos) || parsedPos < 0) {
      throw new ErrorValidacionObjeto('El campo posicion debe ser un entero mayor o igual a 0');
    }
    posicion = parsedPos;
  }

  return {
    nombre: payload.nombre.trim(),
    descripcion: payload.descripcion.trim(),
    tipoObjeto: payload.tipoObjeto.trim(),
    valor,
    nivelObjeto,
    idTienda,
    posicion,
  };
}

export function validarActualizacionObjeto(body: unknown): ActualizarObjetoDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionObjeto('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const resultado: ActualizarObjetoDTO = {};

  if (payload.nombre !== undefined) {
    if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
      throw new ErrorValidacionObjeto('El campo nombre no puede estar vacío');
    }
    resultado.nombre = payload.nombre.trim();
  }

  if (payload.descripcion !== undefined) {
    if (typeof payload.descripcion !== 'string' || payload.descripcion.trim() === '') {
      throw new ErrorValidacionObjeto('El campo descripcion no puede estar vacío');
    }
    resultado.descripcion = payload.descripcion.trim();
  }

  if (payload.tipoObjeto !== undefined) {
    if (typeof payload.tipoObjeto !== 'string' || payload.tipoObjeto.trim() === '') {
      throw new ErrorValidacionObjeto('El campo tipoObjeto no puede estar vacío');
    }
    resultado.tipoObjeto = payload.tipoObjeto.trim();
  }

  if (payload.valor !== undefined) {
    const valor = Number(payload.valor);
    if (isNaN(valor) || valor < 0) {
      throw new ErrorValidacionObjeto('El campo valor debe ser un número mayor o igual a 0');
    }
    resultado.valor = valor;
  }

  if (payload.nivelObjeto !== undefined) {
    const nivel = Number(payload.nivelObjeto);
    if (isNaN(nivel) || nivel < 1) {
      throw new ErrorValidacionObjeto('El campo nivelObjeto debe ser mayor o igual a 1');
    }
    resultado.nivelObjeto = nivel;
  }

  if (payload.idTienda !== undefined) {
    resultado.idTienda = payload.idTienda !== null ? Number(payload.idTienda) : null;
  }

  if (payload.posicion !== undefined) {
    resultado.posicion = Number(payload.posicion);
  }

  return resultado;
}

export function validarCompraObjeto(body: unknown): ComprarObjetoDTO {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ErrorValidacionObjeto('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const camposPermitidos = new Set(['idPersonaje', 'numInventario', 'posicion']);
  const campoDesconocido = Object.keys(payload).find((campo) => !camposPermitidos.has(campo));
  if (campoDesconocido) {
    throw new ErrorValidacionObjeto(`El campo ${campoDesconocido} no está permitido`);
  }

  const idPersonaje = Number(payload.idPersonaje);
  if (!Number.isSafeInteger(idPersonaje) || idPersonaje <= 0) {
    throw new ErrorValidacionObjeto('El campo idPersonaje debe ser un entero mayor a 0');
  }

  const numInventario = Number(payload.numInventario);
  if (!Number.isSafeInteger(numInventario) || numInventario <= 0) {
    throw new ErrorValidacionObjeto('El campo numInventario debe ser un entero mayor a 0');
  }

  const posicion = Number(payload.posicion);
  if (!Number.isSafeInteger(posicion) || posicion < 0) {
    throw new ErrorValidacionObjeto('El campo posicion debe ser un entero mayor o igual a 0');
  }

  return { idPersonaje, numInventario, posicion };
}
