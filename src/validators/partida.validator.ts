import { z } from 'zod';
export class ErrorValidacionPartida extends Error {}
const fields = z.object({ nombre: z.string().trim().min(1).max(100), estado: z.enum(['activa', 'finalizada']), limiteJugadores: z.number().int().positive().max(1000), esPrivada: z.boolean(), contrasena: z.string().min(1).max(100).optional() }).strict();
const create = fields.extend({ idUsuarioAnfitrion: z.number().int().positive().max(2147483647) }).refine(d => !d.esPrivada || !!d.contrasena, 'Las partidas privadas requieren contraseña').refine(d => d.esPrivada || !d.contrasena, 'Una partida pública no debe tener contraseña');
function parse<T>(s: z.ZodType<T>, body: unknown): T {
  const result = s.safeParse(body);
  if (!result.success) throw new ErrorValidacionPartida(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
  return result.data;
}
export const validarCreacionPartida = (body: unknown) => parse(create, body);
export const validarActualizacionPartida = (body: unknown) => parse(fields.partial().refine(d => Object.keys(d).length > 0, 'Enviá al menos un campo'), body);
