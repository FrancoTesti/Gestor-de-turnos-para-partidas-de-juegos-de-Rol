import { z } from 'zod';
import type { ActualizarJugadorDTO, CrearJugadorDTO } from '../types/player.dto';

export const createPlayerSchema: z.ZodType<CrearJugadorDTO> = z.object({
  idUsuario: z.number({ message: 'El campo idUsuario debe ser un número entero positivo' })
    .int('El campo idUsuario debe ser un número entero positivo')
    .positive('El campo idUsuario debe ser un número entero positivo')
    .max(2147483647),
  estado: z.boolean({ message: 'El campo estado debe ser true o false' }),
}).strict();

export const updatePlayerSchema: z.ZodType<ActualizarJugadorDTO> = z.object({
  estado: z.boolean({ message: 'El campo estado debe ser true o false' }).optional(),
}).strict().refine((v) => Object.keys(v).length > 0, 'Debe enviar al menos un campo para actualizar');

export const crearJugadorSchema = createPlayerSchema;
export const actualizarJugadorSchema = updatePlayerSchema;
