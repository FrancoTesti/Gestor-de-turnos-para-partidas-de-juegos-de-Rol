import { z } from 'zod';

const matchFieldsSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  estado: z.enum(['activa', 'finalizada']),
  limiteJugadores: z.number().int().positive().max(1000),
  esPrivada: z.boolean(),
  contrasena: z.string().min(1).max(100).optional(),
}).strict();

export const createMatchSchema = matchFieldsSchema
  .extend({
    idUsuarioAnfitrion: z.number().int().positive().max(2147483647),
  })
  .refine((d) => !d.esPrivada || !!d.contrasena, 'Las partidas privadas requieren contraseña')
  .refine((d) => d.esPrivada || !d.contrasena, 'Una partida pública no debe tener contraseña');

export const updateMatchSchema = matchFieldsSchema
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'Enviá al menos un campo');

export const crearPartidaSchema = createMatchSchema;
export const actualizarPartidaSchema = updateMatchSchema;
