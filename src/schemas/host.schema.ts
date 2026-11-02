import { z } from 'zod';
import type { CrearAnfitrionDTO } from '../types/host.dto';

export const createHostSchema: z.ZodType<CrearAnfitrionDTO> = z.object({
  idUsuario: z.number({ message: 'El campo idUsuario debe ser un número entero positivo' })
    .int('El campo idUsuario debe ser un número entero positivo')
    .positive('El campo idUsuario debe ser un número entero positivo')
    .max(2147483647),
  cantPartidasActuales: z.number({ message: 'El campo cantPartidasActuales debe ser un número entero mayor o igual a 0' })
    .int('El campo cantPartidasActuales debe ser un número entero mayor o igual a 0')
    .min(0, 'El campo cantPartidasActuales debe ser un número entero mayor o igual a 0')
    .default(0),
  karma: z.number({ message: 'El campo karma debe ser un número entero mayor o igual a 0' })
    .int('El campo karma debe ser un número entero mayor o igual a 0')
    .min(0, 'El campo karma debe ser un número entero mayor o igual a 0')
    .default(0),
}).strict();

export const crearAnfitrionSchema = createHostSchema;
