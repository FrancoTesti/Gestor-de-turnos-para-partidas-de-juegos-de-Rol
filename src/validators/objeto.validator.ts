import type { ActualizarObjetoDTO, CrearObjetoDTO } from '../types/objeto.dto';

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

  const idTienda = payload.idTienda !== undefined && payload.idTienda !== null ? Number(payload.idTienda) : null;
  const posicion = payload.posicion !== undefined ? Number(payload.posicion) : 0;

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
