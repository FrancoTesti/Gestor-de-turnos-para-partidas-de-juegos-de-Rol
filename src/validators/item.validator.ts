import { z } from 'zod';
export class ErrorValidacionObjeto extends Error {}
export const ItemValidationError = ErrorValidacionObjeto;
const entero = z.number().int().min(0).max(2147483647);
const schema = z.object({
  nombre: z.string().trim().min(1).max(100), descripcion: z.string().trim().min(1),
  tipoObjeto: z.string().trim().min(1).max(50), valor: entero,
  nivelObjeto: entero.min(1), esUnico: z.boolean().optional(), idTienda: entero.min(1).nullable().optional(), posicion: entero.optional(),
}).strict();
export const compraSchema = z.object({ idPersonaje: entero.min(1), numInventario: entero.min(1), posicion: entero.optional() }).strict();
function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new ErrorValidacionObjeto(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  return result.data;
}
export const validateCreateItem = (body: unknown) => parse(schema, body);
export const validateUpdateItem = (body: unknown) => parse(schema.partial().refine(v => Object.keys(v).length > 0, 'Enviá al menos un campo'), body);
export const validateBuyItem = (body: unknown) => parse(compraSchema, body);

export const validarCreacionObjeto = validateCreateItem;
export const validarActualizacionObjeto = validateUpdateItem;
export const validarCompraObjeto = validateBuyItem;
