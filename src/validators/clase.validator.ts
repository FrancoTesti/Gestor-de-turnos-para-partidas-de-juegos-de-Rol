import { z } from 'zod';
export class ErrorValidacionClase extends Error {}
const schema = z.object({ nombreClase: z.string().trim().min(1).max(50), descripcionClase: z.string().trim().min(1).max(5000) }).strict();
function parse<T>(s: z.ZodType<T>, body: unknown): T {
  const result = s.safeParse(body);
  if (!result.success) throw new ErrorValidacionClase(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  return result.data;
}
export const validarCreacionClase = (body: unknown) => parse(schema, body);
export const validarActualizacionClase = (body: unknown) => parse(schema.partial().refine(v => Object.keys(v).length > 0, 'Enviá al menos un campo'), body);
