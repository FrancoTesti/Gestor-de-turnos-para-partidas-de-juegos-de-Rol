import { z } from 'zod';
export class ErrorValidacionClase extends Error {}
export const ClassValidationError = ErrorValidacionClase;
const schema = z.object({ nombreClase: z.string().trim().min(1).max(50), descripcionClase: z.string().trim().min(1).max(5000) }).strict();
function parse<T>(s: z.ZodType<T>, body: unknown): T {
  const result = s.safeParse(body);
  if (!result.success) throw new ErrorValidacionClase(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  return result.data;
}
export const validateCreateClass = (body: unknown) => parse(schema, body);
export const validateUpdateClass = (body: unknown) => parse(schema.partial().refine(v => Object.keys(v).length > 0, 'Enviá al menos un campo'), body);

export const validarCreacionClase = validateCreateClass;
export const validarActualizacionClase = validateUpdateClass;
