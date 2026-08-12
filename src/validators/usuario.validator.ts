import type { ActualizarUsuarioDTO, CrearUsuarioDTO } from '../types/usuario.dto';

const CAMPOS_PERMITIDOS = ['nombreUsuario', 'contrasena', 'imagen', 'nickname'] as const;

export class ErrorValidacion extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorValidacion';
  }
}

function obtenerObjeto(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ErrorValidacion('El cuerpo de la petición debe ser un objeto JSON');
  }

  return data as Record<string, unknown>;
}

function validarCamposDesconocidos(data: Record<string, unknown>): void {
  const campoDesconocido = Object.keys(data).find(
    (campo) => !CAMPOS_PERMITIDOS.includes(campo as (typeof CAMPOS_PERMITIDOS)[number]),
  );

  if (campoDesconocido) {
    throw new ErrorValidacion(`El campo '${campoDesconocido}' no está permitido`);
  }
}

function validarTexto(
  valor: unknown,
  campo: string,
  minimo: number,
  maximo: number,
  permiteVacio = false,
): string {
  if (typeof valor !== 'string') {
    throw new ErrorValidacion(`El campo '${campo}' debe ser un texto`);
  }

  const texto = valor.trim();
  if (!permiteVacio && texto.length === 0) {
    throw new ErrorValidacion(`El campo '${campo}' es obligatorio`);
  }

  if (texto.length < minimo || texto.length > maximo) {
    throw new ErrorValidacion(
      `El campo '${campo}' debe tener entre ${minimo} y ${maximo} caracteres`,
    );
  }

  return texto;
}

function validarCampo(
  campo: (typeof CAMPOS_PERMITIDOS)[number],
  valor: unknown,
): string {
  switch (campo) {
    case 'nombreUsuario':
      return validarTexto(valor, campo, 2, 50);
    case 'nickname':
      return validarTexto(valor, campo, 3, 50);
    case 'contrasena':
      return validarTexto(valor, campo, 6, 100);
    case 'imagen':
      return validarTexto(valor, campo, 0, 255, true);
  }
}

export function validarCreacionUsuario(data: unknown): CrearUsuarioDTO {
  const objeto = obtenerObjeto(data);
  validarCamposDesconocidos(objeto);

  for (const campo of CAMPOS_PERMITIDOS) {
    if (!(campo in objeto)) {
      throw new ErrorValidacion(`El campo '${campo}' es obligatorio`);
    }
  }

  return {
    nombreUsuario: validarCampo('nombreUsuario', objeto.nombreUsuario),
    contrasena: validarCampo('contrasena', objeto.contrasena),
    imagen: validarCampo('imagen', objeto.imagen),
    nickname: validarCampo('nickname', objeto.nickname),
  };
}

export function validarActualizacionUsuario(data: unknown): ActualizarUsuarioDTO {
  const objeto = obtenerObjeto(data);
  validarCamposDesconocidos(objeto);

  if (Object.keys(objeto).length === 0) {
    throw new ErrorValidacion('Debe enviar al menos un campo para actualizar');
  }

  const resultado: ActualizarUsuarioDTO = {};
  for (const campo of CAMPOS_PERMITIDOS) {
    if (campo in objeto) {
      resultado[campo] = validarCampo(campo, objeto[campo]);
    }
  }

  return resultado;
}