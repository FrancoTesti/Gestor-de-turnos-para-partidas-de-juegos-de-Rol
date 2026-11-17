import { z } from 'zod';

export const createShopSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  claseTienda: z.string().trim().min(1).max(50),
  idClase: z.number().int().positive().max(2147483647).nullable().optional(),
  idPartida: z.number().int().positive().max(2147483647).nullable().optional(),
}).strict();

export const updateShopSchema = createShopSchema
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Enviá al menos un campo');

export const crearTiendaSchema = createShopSchema;
export const actualizarTiendaSchema = updateShopSchema;
