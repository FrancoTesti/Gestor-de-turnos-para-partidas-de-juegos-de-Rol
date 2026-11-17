import { z } from 'zod';

const entero = z.number().int().min(0).max(2147483647);

export const createItemSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().min(1),
  tipoObjeto: z.string().trim().min(1).max(50),
  valor: entero,
  nivelObjeto: entero.min(1),
  esUnico: z.boolean().optional(),
  idTienda: entero.min(1).nullable().optional(),
  posicion: entero.optional(),
}).strict();

export const updateItemSchema = createItemSchema
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Enviá al menos un campo');

export const buyItemSchema = z.object({
  idPersonaje: entero.min(1),
  numInventario: entero.min(1),
  posicion: entero.optional(),
}).strict();

export const compraSchema = buyItemSchema;
export const crearObjetoSchema = createItemSchema;
export const actualizarObjetoSchema = updateItemSchema;
