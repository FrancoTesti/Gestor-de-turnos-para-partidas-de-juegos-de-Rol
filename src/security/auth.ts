import { randomBytes, createHash } from 'node:crypto';
import { Router, type Request, type RequestHandler } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { z } from 'zod';
import { Usuario } from '../entities/Usuario.entity';
import { Jugador } from '../entities/Jugador.entity';
import { Anfitrion } from '../entities/Anfitrion.entity';
import { crearUsuarioSchema } from '../schemas/usuario.schema';
import { hashPassword, verifyPassword } from './password';

export interface Identity { idUsuario: number; anfitrion: boolean; jugador: boolean }
declare global { namespace Express { interface Request { identity?: Identity } } }
export const publicUser = (u: Usuario) => ({ idUsuario: u.idUsuario, nombreUsuario: u.nombreUsuario, nickname: u.nickname, imagen: u.imagen });
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const cookieName = 'rpg_session';
const sessionDuration = 8 * 60 * 60 * 1000;

export function createAuth(em: EntityManager) {
  // Los tokens solo se entregan en cookies HttpOnly. Reiniciar el servidor cierra sesiones.
  const sessions = new Map<string, { id: number; password: string; expires: number }>();
  const attempts = new Map<string, { count: number; expires: number }>();
  const cookie = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/api' };
  const tokenFrom = (req: Request) => req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const identity = async (u: Usuario): Promise<Identity> => ({
    idUsuario: u.idUsuario,
    anfitrion: !!await em.findOne(Anfitrion, { usuario: { idUsuario: u.idUsuario } }),
    jugador: !!await em.findOne(Jugador, { usuario: { idUsuario: u.idUsuario } }),
  });
  const requireAuth: RequestHandler = async (req, res, next) => {
    const token = tokenFrom(req);
    const key = token ? digest(token) : '';
    const session = sessions.get(key);
    if (!session || session.expires <= Date.now()) {
      sessions.delete(key);
      res.status(401).json({ message: 'Iniciá sesión para continuar' }); return;
    }
    const user = await em.findOne(Usuario, { idUsuario: session.id });
    if (!user || user.contrasena !== session.password) {
      sessions.delete(key); res.status(401).json({ message: 'La sesión expiró' }); return;
    }
    req.identity = await identity(user);
    next();
  };
  const router = Router();
  router.use((req, res, next) => {
    if (req.method !== 'POST' || req.path === '/logout') { next(); return; }
    const now = Date.now();
    for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
    const key = req.ip ?? 'unknown';
    const value = attempts.get(key) ?? { count: 0, expires: now + 15 * 60 * 1000 };
    value.count++; attempts.set(key, value);
    if (value.count > 30) { res.status(429).json({ message: 'Demasiados intentos. Probá en 15 minutos.' }); return; }
    next();
  });
  router.post('/register', async (req, res) => {
    const data = crearUsuarioSchema.extend({ tipo: z.enum(['jugador', 'anfitrion']) }).parse(req.body);
    const result = await em.transactional(async tx => {
      const u = tx.create(Usuario, { nombreUsuario: data.nombreUsuario, nickname: data.nickname, imagen: data.imagen ?? '', contrasena: await hashPassword(data.contrasena) });
      if (data.tipo === 'jugador') tx.create(Jugador, { usuario: u, estado: true });
      else tx.create(Anfitrion, { usuario: u, cantPartidasActuales: 0, karma: 0 });
      await tx.flush();
      return publicUser(u);
    });
    res.status(201).json(result);
  });
  router.post('/login', async (req, res) => {
    const data = z.object({ nickname: z.string().trim().min(1).max(50), contrasena: z.string().min(1).max(100) }).strict().parse(req.body);
    const u = await em.findOne(Usuario, { nickname: data.nickname });
    // Derivación aun para nombres inexistentes: evita la respuesta rápida por usuario desconocido.
    const valid = await verifyPassword(data.contrasena, u?.contrasena ?? `s$${'0'.repeat(32)}$${'0'.repeat(64)}`);
    if (!u || !valid) { res.status(401).json({ message: 'Usuario o contraseña incorrecta' }); return; }
    for (const [key, value] of sessions) if (value.expires <= Date.now() || value.id === u.idUsuario) sessions.delete(key);
    if (sessions.size >= 5000) { res.status(503).json({ message: 'Servidor ocupado. Intentá más tarde.' }); return; }
    const token = randomBytes(32).toString('hex');
    sessions.set(digest(token), { id: u.idUsuario, password: u.contrasena, expires: Date.now() + sessionDuration });
    res.cookie(cookieName, token, { ...cookie, maxAge: sessionDuration }).json({ usuario: publicUser(u), roles: await identity(u) });
  });
  router.get('/me', requireAuth, async (req, res) => {
    const u = await em.findOneOrFail(Usuario, { idUsuario: req.identity!.idUsuario });
    res.json({ usuario: publicUser(u), roles: req.identity });
  });
  router.post('/logout', (req, res) => {
    const token = tokenFrom(req); if (token) sessions.delete(digest(token));
    res.clearCookie(cookieName, cookie).sendStatus(204);
  });
  return { router, requireAuth };
}
