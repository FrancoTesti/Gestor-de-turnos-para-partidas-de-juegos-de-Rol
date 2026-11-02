import type { Request, Response, NextFunction } from 'express';
import type { ZodType, ZodTypeAny } from 'zod';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const ErrorValidacion = ValidationError;

/**
 * Validador general de payloads mediante esquemas Zod.
 * Centraliza la validación de datos y lanza un único ValidationError (HTTP 400).
 */
export function validatePayload<T>(schema: ZodType<T>, data: unknown): T {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ValidationError('El cuerpo de la solicitud debe ser un objeto JSON');
  }
  const resultado = schema.safeParse(data);
  if (!resultado.success) {
    const detalle = resultado.error.issues
      .map((i) => (i.path.length > 0 ? `${i.path.join('.')}: ${i.message}` : i.message))
      .join('; ');
    throw new ValidationError(detalle || 'Datos de entrada inválidos');
  }
  return resultado.data;
}

export const validarDatos = validatePayload;

/**
 * Middleware Express transversal que valida cualquier esquema de Zod.
 */
export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: resultado.error.issues.map((i) => ({
          campo: i.path.join('.') || 'body',
          mensaje: i.message,
        })),
      });
    }

    req.body = resultado.data;
    next();
  };
}

export const validar = validate;
