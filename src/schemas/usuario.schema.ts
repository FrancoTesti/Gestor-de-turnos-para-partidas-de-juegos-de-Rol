import { z } from 'zod';

// Zod: validamos los datos en TIEMPO DE EJECUCION
// .strict() impide que se envíen campos no definidos (como idUsuario) en el body
export const crearUsuarioSchema = z.object({
  nombreUsuario: z.string({ message: 'El campo nombreUsuario es obligatorio' })
    .trim()
    .min(2, 'El campo nombreUsuario debe tener al menos 2 caracteres')
    .max(50, 'El campo nombreUsuario no puede superar 50 caracteres'),
  nickname: z.string({ message: 'El campo nickname es obligatorio' })
    .trim()
    .min(3, 'El campo nickname debe tener al menos 3 caracteres')
    .max(50, 'El campo nickname no puede superar 50 caracteres'),
  contrasena: z.string({ message: 'El campo contrasena es obligatorio' })
    .min(6, 'El campo contrasena debe tener al menos 6 caracteres')
    .max(100, 'El campo contrasena no puede superar 100 caracteres'),
  imagen: z.string().max(255, 'El campo imagen no puede superar 255 caracteres').optional(),
}).strict();

// Para el PUT: todos los campos opcionales, estricto (no idUsuario) y rechaza objeto vacío {}
export const actualizarUsuarioSchema = crearUsuarioSchema
  .partial()
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type CrearUsuarioZodDTO = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioZodDTO = z.infer<typeof actualizarUsuarioSchema>;
