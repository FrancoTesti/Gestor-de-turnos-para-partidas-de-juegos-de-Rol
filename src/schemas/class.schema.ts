import { z } from 'zod';

export const createClassSchema = z.object({
  nombreClase: z.string().trim().min(1, 'El campo nombreClase no puede estar vacío').max(50),
  descripcionClase: z.string().trim().min(1, 'El campo descripcionClase no puede estar vacío').max(5000),
}).strict();

export const updateClassSchema = createClassSchema
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Enviá al menos un campo');

export const crearClaseSchema = createClassSchema;
export const actualizarClaseSchema = updateClassSchema;
