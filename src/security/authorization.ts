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
  const p = await em.findOne(Personaje, { idPersonaje: id }, { populate: ['jugador.usuario', 'partida'] });
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

// Política de los CRUD existentes. Los casos de uso nuevos comprueban permisos en sus transacciones.
export function authorizeCrud(em: EntityManager): RequestHandler {
  return async (req, _res, next) => {
    if (req.method === 'GET') { next(); return; }
    const user = req.identity!;
    const [resource, rawId, action] = req.path.split('/').filter(Boolean);
    if (['sesiones', 'misiones', 'inventarios'].includes(resource) || action === 'vender') { next(); return; }
    const id = rawId ? routeId(rawId) : undefined;
    if (resource === 'usuarios') {
      if (req.method === 'POST' ? !user.anfitrion : id !== user.idUsuario) throw new HttpError(403, 'Solo podés modificar tu propia cuenta');
    } else if (resource === 'jugadores' || resource === 'anfitriones') {
      if ((id ?? req.body.idUsuario) !== user.idUsuario) throw new HttpError(403, 'Solo podés modificar tu propio perfil');
      if (resource === 'anfitriones' && req.method !== 'DELETE') {
        if (req.method === 'PUT') throw new HttpError(403, 'El karma y la cantidad de partidas se calculan en el servidor');
        req.body = { idUsuario: user.idUsuario, cantPartidasActuales: 0, karma: 0 };
      }
    } else if (resource === 'personajes') {
      if (req.method === 'POST') {
        if (!user.jugador || req.body.idUsuarioJugador !== user.idUsuario) throw new HttpError(403, 'Creá un personaje para tu propio jugador');
        req.body = { ...req.body, dinero: 100, xp: 0, nivel: 1 };
      } else {
        await ownedCharacter(em, id!, user.idUsuario);
        if (req.method === 'PUT' && Object.keys(req.body).some(k => !['nombreFicticio', 'raza', 'idClase'].includes(k))) throw new HttpError(403, 'Solo podés editar nombre, raza y clase; la progresión se obtiene en misiones');
      }
    } else if (resource === 'partidas') {
      if (req.method === 'POST') {
        if (!user.anfitrion || req.body.idUsuarioAnfitrion !== user.idUsuario) throw new HttpError(403, 'Creá partidas como tu propio anfitrión');
      } else await hostedGame(em, id!, user.idUsuario);
    } else if (resource === 'objetos' && action === 'comprar') {
      await ownedCharacter(em, idSchema.parse(req.body.idPersonaje), user.idUsuario);
    } else if (['objetos', 'clases', 'tiendas'].includes(resource)) {
      if (!user.anfitrion) throw new HttpError(403, 'El catálogo lo administran los anfitriones');
      if (resource === 'objetos' && id) {
        const objeto = await em.findOne(Objeto, { idObjeto: id });
        if (objeto?.inventario) throw new HttpError(409, 'Un objeto adquirido solo puede moverse mediante el inventario o una venta');
      }
    } else throw new HttpError(403, 'Operación no autorizada');
    next();
  };
}
