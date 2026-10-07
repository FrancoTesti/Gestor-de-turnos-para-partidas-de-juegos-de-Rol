import type { RequestHandler } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { Personaje } from '../entities/Personaje.entity';
import { Partida } from '../entities/Partida.entity';
import { Objeto } from '../entities/Objeto.entity';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const idSchema = z.number().int().positive().max(2147483647);
export const routeId = (value: string) => {
  if (!/^\d+$/.test(value)) throw new HttpError(400, 'ID inválido');
  return idSchema.parse(Number(value));
};
export async function ownedCharacter(em: EntityManager, id: number, userId: number) {
  const p = await em.findOne(Personaje, { idPersonaje: id }, { populate: ['jugador.usuario', 'partida', 'clase'] });
  if (!p) throw new HttpError(404, 'Personaje no encontrado');
  if (p.jugador.usuario.idUsuario !== userId) throw new HttpError(403, 'Ese personaje pertenece a otro jugador');
  return p;
}
export async function hostedGame(em: EntityManager, id: number, userId: number) {
  const p = await em.findOne(Partida, { idPartida: id }, { populate: ['anfitrion.usuario'] });
  if (!p) throw new HttpError(404, 'Partida no encontrada');
  if (p.anfitrion.usuario.idUsuario !== userId) throw new HttpError(403, 'Solo el anfitrión de esta partida puede modificarla');
  return p;
}

export const requireAnfitrion: RequestHandler = (req, _res, next) => {
  if (!req.identity?.anfitrion) return next(new HttpError(403, 'El catálogo lo administran los anfitriones'));
  next();
};

export const requireOwnUser = (paramName: string = 'id'): RequestHandler => (req, _res, next) => {
  const id = routeId(req.params[paramName] as string);
  if (id !== req.identity?.idUsuario) return next(new HttpError(403, 'Solo podés modificar tu propia cuenta'));
  next();
};

export const requireCreateUserAsAnfitrion: RequestHandler = (req, _res, next) => {
  if (!req.identity?.anfitrion) return next(new HttpError(403, 'Solo podés modificar tu propia cuenta'));
  next();
};

export const requireOwnProfile = (paramName: string = 'id'): RequestHandler => (req, _res, next) => {
  const id = req.params[paramName] as string ? routeId(req.params[paramName] as string) : req.body.idUsuario;
  if (id !== req.identity?.idUsuario) return next(new HttpError(403, 'Solo podés modificar tu propio perfil'));
  next();
};

export const requireCreateOwnProfile: RequestHandler = (req, _res, next) => {
  const id = req.body.idUsuario;
  if (id !== req.identity?.idUsuario) return next(new HttpError(403, 'Solo podés modificar tu propio perfil'));
  next();
};

export const anfitrionPutProtection: RequestHandler = (req, _res, next) => {
  if (req.method === 'PUT') return next(new HttpError(403, 'El karma y la cantidad de partidas se calculan en el servidor'));
  next();
};

export const anfitrionDeleteProtection: RequestHandler = (req, _res, next) => {
  // on DELETE we do nothing extra here, profile protection handles it.
  next();
};

export const requireOwnJugadorForPersonaje: RequestHandler = (req, _res, next) => {
  if (!req.identity?.jugador || req.body.idUsuarioJugador !== req.identity.idUsuario) {
    return next(new HttpError(403, 'Creá un personaje para tu propio jugador'));
  }
  req.body = { ...req.body, dinero: 100, xp: 0, nivel: 1 };
  next();
};

export const requireOwnedCharacterMiddleware = (em: EntityManager, paramName: string = 'id'): RequestHandler => async (req, _res, next) => {
  try {
    const id = routeId(req.params[paramName] as string);
    await ownedCharacter(em, id, req.identity!.idUsuario);
    if (req.method === 'PUT') {
      if (Object.keys(req.body).some(k => !['nombreFicticio', 'raza', 'idClase'].includes(k))) {
        throw new HttpError(403, 'Solo podés editar nombre, raza y clase; la progresión se obtiene en misiones');
      }
    }
    next();
  } catch (err) { next(err); }
};

export const requireHostedGameMiddleware = (em: EntityManager, paramName: string = 'id'): RequestHandler => async (req, _res, next) => {
  try {
    const id = routeId(req.params[paramName] as string);
    await hostedGame(em, id, req.identity!.idUsuario);
    next();
  } catch (err) { next(err); }
};

export const requireAnfitrionForPartida: RequestHandler = (req, _res, next) => {
  if (!req.identity?.anfitrion || req.body.idUsuarioAnfitrion !== req.identity.idUsuario) {
    return next(new HttpError(403, 'Creá partidas como tu propio anfitrión'));
  }
  next();
};

export const protectObjetoModifications = (em: EntityManager, paramName: string = 'id'): RequestHandler => async (req, _res, next) => {
  try {
    const id = routeId(req.params[paramName] as string);
    const objeto = await em.findOne(Objeto, { idObjeto: id });
    if (objeto?.inventario) throw new HttpError(409, 'Un objeto adquirido solo puede moverse mediante el inventario o una venta');
    next();
  } catch (err) { next(err); }
};

export const requireOwnedCharacterForCompra = (em: EntityManager): RequestHandler => async (req, _res, next) => {
  try {
    await ownedCharacter(em, idSchema.parse(req.body.idPersonaje), req.identity!.idUsuario);
    next();
  } catch (err) { next(err); }
};

