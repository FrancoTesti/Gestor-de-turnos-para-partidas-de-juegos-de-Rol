import type { ActualizarUsuarioDTO, CrearUsuarioDTO } from '../types/usuario.dto';

/**
 * Lista de campos permitidos en la creación y actualización de usuarios.
 */
const CAMPOS_PERMITIDOS = ['nombreUsuario', 'contrasena', 'imagen', 'nickname'] as const;

/* demostracion teórica de Prototipos ( por si nos preguntan en el coloquio):
 Al usar 'class' y 'extends', JS configura la "prototype chain" por detrás.
 Es la forma moderna de heredar en vez de usar Object.create(Error.prototype) */
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

const validarCamposDesconocidos = function(data: Record<string, unknown>): void {
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

  CAMPOS_PERMITIDOS.forEach((campo) => {
    if (!(campo in objeto)) {
      throw new ErrorValidacion(`El campo '${campo}' es obligatorio`);
    }
  });

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
  // con Object.entries recorremos clave y valor al mismo tiempo
  for (const [campo, valor] of Object.entries(objeto)) {
    resultado[campo as keyof ActualizarUsuarioDTO] = validarCampo(campo as any, valor);
  }

  return resultado;
}