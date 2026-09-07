import { z } from 'zod';
export class ErrorValidacionTienda extends Error {}
const schema = z.object({ nombre: z.string().trim().min(1).max(100), claseTienda: z.string().trim().min(1).max(50), idClase: z.number().int().positive().max(2147483647).nullable().optional() }).strict();
function parse<T>(s: z.ZodType<T>, body: unknown): T {
  const result = s.safeParse(body);
  if (!result.success) throw new ErrorValidacionTienda(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  return result.data;
}
export const validarCreacionTienda = (body: unknown) => parse(schema, body);
export const validarActualizacionTienda = (body: unknown) => parse(schema.partial().refine(v => Object.keys(v).length > 0, 'Enviá al menos un campo'), body);
