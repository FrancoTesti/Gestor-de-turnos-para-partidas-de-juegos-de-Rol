import { z } from 'zod';
import type { ActualizarPersonajeDTO, CrearPersonajeDTO } from '../types/character.dto';

const positiveId = (campo: string) =>
  z.number({ message: `El campo ${campo} es obligatorio` })
    .int(`El campo '${campo}' debe ser un número entero mayor o igual a 1`)
    .min(1, `El campo '${campo}' debe ser un número entero mayor o igual a 1`)
    .max(2147483647, `El campo '${campo}' supera el límite permitido`);

export const createCharacterSchema: z.ZodType<CrearPersonajeDTO> = z.object({
  nombreFicticio: z.string({ message: 'El campo nombreFicticio es obligatorio' })
    .trim()
    .min(1, "El campo 'nombreFicticio' no puede estar vacío")
    .max(100, "El campo 'nombreFicticio' supera el máximo de 100 caracteres"),
  raza: z.string({ message: 'El campo raza es obligatorio' })
    .trim()
    .min(1, "El campo 'raza' no puede estar vacío")
    .max(50, "El campo 'raza' supera el máximo de 50 caracteres"),
  idClase: positiveId('idClase'),
  idUsuarioJugador: positiveId('idUsuarioJugador'),
  idPartida: positiveId('idPartida'),
  contrasenaPartida: z.string({ message: 'Contraseña de partida inválida' })
    .max(100, 'Contraseña de partida inválida')
    .optional(),
});

export const updateCharacterSchema: z.ZodType<ActualizarPersonajeDTO> = z.object({
  nombreFicticio: z.string({ message: "El campo 'nombreFicticio' debe ser un texto" })
    .trim()
    .min(1, "El campo 'nombreFicticio' no puede estar vacío")
    .max(100, "El campo 'nombreFicticio' supera el máximo de 100 caracteres")
    .optional(),
  raza: z.string({ message: "El campo 'raza' debe ser un texto" })
    .trim()
    .min(1, "El campo 'raza' no puede estar vacío")
    .max(50, "El campo 'raza' supera el máximo de 50 caracteres")
    .optional(),
  idClase: positiveId('idClase').optional(),
}).refine((v) => Object.keys(v).length > 0, 'Debe enviar al menos un campo para actualizar');

export const crearPersonajeSchema = createCharacterSchema;
export const actualizarPersonajeSchema = updateCharacterSchema;
