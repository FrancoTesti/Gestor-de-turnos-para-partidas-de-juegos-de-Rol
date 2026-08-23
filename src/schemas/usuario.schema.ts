import { z } from 'zod';

// Zod: validamos los datos en TIEMPO DE EJECUCION (lo que manda el usuario en 
// el body(el "paquete" donde viajan los datos que mandas desde el frontend hacia el backend))
export const crearUsuarioSchema = z.object({
  nombreUsuario: z.string().min(2, 'Debe tener al menos 2 caracteres').max(50),
  nickname: z.string().min(3, 'Debe tener al menos 3 caracteres').max(50),
  contrasena: z.string().min(6, 'Debe tener al menos 6 caracteres').max(100),
  imagen: z.string().max(255).optional(), // optional permite que este vacio
});

// Zod nos da el .partial() que hace que todos los campos sean opcionales para el PUT
export const actualizarUsuarioSchema = crearUsuarioSchema.partial(); 

/* z.infer extrae el tipo TypeScript directamente del esquema.
 "Una sola fuente de verdad": Si cambias la regla arriba, el tipo cambia solo */
export type CrearUsuarioZodDTO = z.infer<typeof crearUsuarioSchema>;