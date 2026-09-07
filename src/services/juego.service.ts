import { EntityManager, LockMode } from '@mikro-orm/core';
import { z } from 'zod';
import { Sesion } from '../entities/Sesion.entity';
import { Mision } from '../entities/Mision.entity';
import { Inventario } from '../entities/Inventario.entity';
import { Personaje } from '../entities/Personaje.entity';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';
import { Objeto } from '../entities/Objeto.entity';
import { Tienda } from '../entities/Tienda.entity';
import { Anfitrion } from '../entities/Anfitrion.entity';
import { HttpError, hostedGame, ownedCharacter, idSchema } from '../security/authorization';
import { rangoVenta } from './venta.rules';

const amount = z.number().int().min(0).max(2147483647);
export const sessionSchema = z.object({ idPartida: idSchema, numSesion: idSchema, duracionSesion: amount }).strict();
export const missionSchema = z.object({
  idPartida: idSchema, numSesion: idSchema, numMision: idSchema,
  descripcion: z.string().trim().min(1).max(5000), dineroTotal: amount, xpTotal: amount,
  asistenciaGrupoGrande: amount.default(0),
}).strict();
export const inventorySchema = z.object({ idPersonaje: idSchema, numInventario: idSchema, cantidadEspacio: idSchema.max(1000) }).strict();
export const participationSchema = z.object({ idPersonajes: z.array(idSchema).min(1).max(1000).refine(ids => new Set(ids).size === ids.length, 'Hay personajes repetidos') }).strict();
export const rewardSchema = z.object({ recompensas: z.array(z.object({ idPersonaje: idSchema, dinero: amount, xp: amount }).strict()).min(1).max(1000).refine(items => new Set(items.map(i => i.idPersonaje)).size === items.length, 'Hay personajes repetidos') }).strict();
export const saleSchema = z.object({ idPersonaje: idSchema, idTienda: idSchema, precio: amount }).strict();
const lock = { lockMode: LockMode.PESSIMISTIC_WRITE } as const;
const conflict = (condition: boolean, message: string) => { if (condition) throw new HttpError(409, message); };
export const sessionDTO = (s: Sesion) => ({ idPartida: s.partida.idPartida, numSesion: s.numSesion, duracionSesion: s.duracionSesion, cantJugadores: s.cantJugadores, estadoSesion: s.estadoSesion });
export const missionDTO = (m: Mision) => ({ idPartida: m.sesion.partida.idPartida, numSesion: m.sesion.numSesion, numMision: m.numMision, descripcion: m.descripcion, dineroTotal: m.dineroTotal, xpTotal: m.xpTotal, dineroOtorgadoAJugadores: m.dineroOtorgadoAJugadores, xpOtorgadoJugadores: m.xpOtorgadoJugadores, asistenciaGrupoGrande: m.asistenciaGrupoGrande, estado: m.estado });
export const inventoryDTO = (i: Inventario) => ({ idPersonaje: i.personaje.idPersonaje, numInventario: i.numInventario, cantidadEspacio: i.cantidadEspacio });

export class JuegoService {
  constructor(private em: EntityManager) {}

  async saveSession(user: number, body: unknown, update = false) {
    const data = sessionSchema.parse(body);
    return this.em.transactional(async tx => {
      const partida = await hostedGame(tx, data.idPartida, user);
      await tx.lock(partida, LockMode.PESSIMISTIC_WRITE);
      conflict(!partida.estado, 'La partida está finalizada');
      let sesion = await tx.findOne(Sesion, { partida, numSesion: data.numSesion }, lock);
      if (update && !sesion) throw new HttpError(404, 'Sesión no encontrada');
      conflict(!update && !!sesion, 'Ese número de sesión ya existe');
      conflict(!!sesion && sesion.estadoSesion !== 0, 'Solo se pueden editar sesiones planificadas');
      sesion ??= tx.create(Sesion, { partida, numSesion: data.numSesion, duracionSesion: data.duracionSesion, estadoSesion: 0, cantJugadores: 0 });
      sesion.duracionSesion = data.duracionSesion;
      await tx.flush(); return sessionDTO(sesion);
    });
  }

  private async session(tx: EntityManager, game: number, number: number) {
    const s = await tx.findOne(Sesion, { partida: { idPartida: game }, numSesion: number }, { ...lock, populate: ['partida.anfitrion.usuario'] });
    if (!s) throw new HttpError(404, 'Sesión no encontrada');
    return s;
  }

  async play(user: number, game: number, number: number, body: unknown) {
    const data = participationSchema.parse(body);
    return this.em.transactional(async tx => {
      const partida = await hostedGame(tx, game, user);
      await tx.lock(partida, LockMode.PESSIMISTIC_WRITE);
      const sesion = await this.session(tx, game, number);
      conflict(!partida.estado || sesion.estadoSesion !== 0, 'La partida debe estar activa y la sesión planificada');
      conflict(!!await tx.findOne(Sesion, { partida, estadoSesion: 1 }), 'Ya hay otra sesión en curso en esta partida');
      conflict(data.idPersonajes.length > partida.limiteJugadores, 'Se supera el límite de jugadores');
      const characters = await tx.find(Personaje, { idPersonaje: { $in: data.idPersonajes }, partida }, { ...lock, populate: ['jugador.usuario'], orderBy: { idPersonaje: 'asc' } });
      conflict(characters.length !== data.idPersonajes.length, 'Todos los personajes deben pertenecer a esta partida');
      conflict(new Set(characters.map(p => p.jugador.usuario.idUsuario)).size !== characters.length, 'Un jugador no puede participar con dos personajes');
      for (const personaje of characters) tx.create(PersonajeSesion, { personaje, sesion, dioKarma: false });
      sesion.cantJugadores = characters.length; sesion.estadoSesion = 1;
      await tx.flush(); return sessionDTO(sesion);
    });
  }

  async finish(user: number, game: number, number: number) {
    return this.em.transactional(async tx => {
      await hostedGame(tx, game, user);
      const s = await this.session(tx, game, number);
      conflict(s.estadoSesion !== 1, 'La sesión no está en curso');
      conflict(await tx.count(Mision, { sesion: s, estado: false }) > 0, 'Completá o eliminá las misiones pendientes antes de finalizar');
      s.estadoSesion = 2; await tx.flush(); return sessionDTO(s);
    });
  }

  async deleteSession(user: number, game: number, number: number) {
    await this.em.transactional(async tx => {
      await hostedGame(tx, game, user);
      const s = await this.session(tx, game, number);
      conflict(s.estadoSesion !== 0, 'No se puede borrar el historial de una sesión iniciada');
      conflict(await tx.count(Mision, { sesion: s }) > 0, 'Eliminá primero las misiones de esta sesión');
      await tx.removeAndFlush(s);
    });
  }

  async saveMission(user: number, body: unknown, update = false) {
    const data = missionSchema.parse(body);
    return this.em.transactional(async tx => {
      await hostedGame(tx, data.idPartida, user);
      const sesion = await this.session(tx, data.idPartida, data.numSesion);
      conflict(sesion.estadoSesion === 2, 'La sesión está finalizada');
      let m = await tx.findOne(Mision, { sesion, numMision: data.numMision }, lock);
      if (update && !m) throw new HttpError(404, 'Misión no encontrada');
      conflict(!update && !!m, 'Ese número de misión ya existe');
      conflict(m?.estado === true, 'Una misión completada no se puede modificar');
      const fields = { descripcion: data.descripcion, dineroTotal: data.dineroTotal, xpTotal: data.xpTotal, asistenciaGrupoGrande: data.asistenciaGrupoGrande };
      m ??= tx.create(Mision, { sesion, numMision: data.numMision, ...fields, estado: false, dineroOtorgadoAJugadores: 0, xpOtorgadoJugadores: 0 });
      Object.assign(m, fields); await tx.flush(); return missionDTO(m);
    });
  }

  async completeMission(user: number, game: number, number: number, mission: number, body: unknown) {
    const data = rewardSchema.parse(body);
    return this.em.transactional(async tx => {
      await hostedGame(tx, game, user);
      const sesion = await this.session(tx, game, number);
      const m = await tx.findOne(Mision, { sesion, numMision: mission }, lock);
      if (!m) throw new HttpError(404, 'Misión no encontrada');
      conflict(sesion.estadoSesion !== 1 || m.estado, 'La sesión debe estar en curso y la misión pendiente');
      const attendees = await tx.find(PersonajeSesion, { sesion });
      const ids = new Set(attendees.map(a => a.personaje.idPersonaje));
      conflict(data.recompensas.some(r => !ids.has(r.idPersonaje)), 'Solo los participantes de la sesión pueden recibir recompensas');
      const money = data.recompensas.reduce((n, r) => n + r.dinero, 0);
      const xp = data.recompensas.reduce((n, r) => n + r.xp, 0);
      conflict(money !== m.dineroTotal || xp !== m.xpTotal, 'El reparto debe coincidir exactamente con el dinero y XP de la misión');
      for (const reward of [...data.recompensas].sort((a, b) => a.idPersonaje - b.idPersonaje)) {
        const p = await tx.findOneOrFail(Personaje, { idPersonaje: reward.idPersonaje }, lock);
        conflict(p.dinero + reward.dinero > 2147483647 || p.xp + reward.xp > 2147483647, 'La recompensa excede el límite de almacenamiento');
        p.dinero += reward.dinero; p.xp += reward.xp;
      }
      m.estado = true; m.dineroOtorgadoAJugadores = money; m.xpOtorgadoJugadores = xp;
      await tx.flush(); return missionDTO(m);
    });
  }

  async deleteMission(user: number, game: number, number: number, mission: number) {
    await this.em.transactional(async tx => {
      await hostedGame(tx, game, user);
      const s = await this.session(tx, game, number);
      const m = await tx.findOne(Mision, { sesion: s, numMision: mission }, lock);
      if (!m) throw new HttpError(404, 'Misión no encontrada');
      conflict(m.estado || s.estadoSesion === 2, 'No se puede borrar una misión completada ni una sesión finalizada');
      await tx.removeAndFlush(m);
    });
  }

  async rate(user: number, game: number, number: number, body: unknown) {
    const { valor } = z.object({ valor: z.union([z.literal(-1), z.literal(1)]) }).strict().parse(body);
    return this.em.transactional(async tx => {
      const sesion = await this.session(tx, game, number);
      conflict(sesion.estadoSesion !== 2, 'La sesión debe estar finalizada');
      conflict(sesion.partida.anfitrion.usuario.idUsuario === user, 'No podés calificarte a vos mismo');
      const allAttendance = await tx.find(PersonajeSesion, { sesion }, { ...lock, populate: ['personaje.jugador.usuario'] });
      const attendance = allAttendance.filter(a => a.personaje.jugador.usuario.idUsuario === user);
      if (!attendance.length) throw new HttpError(403, 'Solo pueden calificar los jugadores que participaron');
      conflict(attendance.some(a => a.dioKarma), 'Ya calificaste esta sesión');
      const host = await tx.findOneOrFail(Anfitrion, { usuario: { idUsuario: sesion.partida.anfitrion.usuario.idUsuario } }, lock);
      host.karma += valor; attendance.forEach(a => { a.dioKarma = true; });
      await tx.flush(); return { karma: host.karma };
    });
  }

  async saveInventory(user: number, body: unknown, update = false) {
    const data = inventorySchema.parse(body);
    return this.em.transactional(async tx => {
      const personaje = await ownedCharacter(tx, data.idPersonaje, user);
      await tx.lock(personaje, LockMode.PESSIMISTIC_WRITE);
      let inv = await tx.findOne(Inventario, { personaje, numInventario: data.numInventario }, lock);
      if (update && !inv) throw new HttpError(404, 'Inventario no encontrado');
      conflict(!update && !!inv, 'Ese inventario ya existe');
      if (inv) conflict(await tx.count(Objeto, { inventario: inv, posicion: { $gte: data.cantidadEspacio } }) > 0, 'Mové los objetos antes de reducir la capacidad');
      inv ??= tx.create(Inventario, { personaje, numInventario: data.numInventario, cantidadEspacio: data.cantidadEspacio });
      inv.cantidadEspacio = data.cantidadEspacio; await tx.flush(); return inventoryDTO(inv);
    });
  }

  async deleteInventory(user: number, character: number, number: number) {
    await this.em.transactional(async tx => {
      const p = await ownedCharacter(tx, character, user);
      await tx.lock(p, LockMode.PESSIMISTIC_WRITE);
      const inv = await tx.findOne(Inventario, { personaje: p, numInventario: number }, lock);
      if (!inv) throw new HttpError(404, 'Inventario no encontrado');
      conflict(await tx.count(Objeto, { inventario: inv }) > 0, 'El inventario debe estar vacío');
      await tx.removeAndFlush(inv);
    });
  }

  async moveObject(user: number, character: number, number: number, body: unknown) {
    const data = z.object({ idObjeto: idSchema, posicion: amount }).strict().parse(body);
    return this.em.transactional(async tx => {
      const object = await tx.findOne(Objeto, { idObjeto: data.idObjeto }, { ...lock, populate: ['inventario.personaje'] });
      if (!object) throw new HttpError(404, 'Objeto no encontrado');
      const p = await ownedCharacter(tx, character, user);
      await tx.lock(p, LockMode.PESSIMISTIC_WRITE);
      if (object.inventario?.personaje.idPersonaje !== character) throw new HttpError(403, 'El objeto no pertenece al personaje');
      const inv = await tx.findOne(Inventario, { personaje: p, numInventario: number }, lock);
      if (!inv) throw new HttpError(404, 'Inventario no encontrado');
      conflict(data.posicion >= inv.cantidadEspacio, 'La posición está fuera del inventario');
      conflict(!!await tx.findOne(Objeto, { inventario: inv, posicion: data.posicion, idObjeto: { $ne: object.idObjeto } }), 'La posición está ocupada');
      object.inventario = inv; object.posicion = data.posicion; await tx.flush();
      return { idObjeto: object.idObjeto, ...inventoryDTO(inv), posicion: object.posicion };
    });
  }

  async sell(user: number, objectId: number, body: unknown) {
    const data = saleSchema.parse(body);
    return this.em.transactional(async tx => {
      const object = await tx.findOne(Objeto, { idObjeto: objectId }, { ...lock, populate: ['inventario.personaje'] });
      if (!object) throw new HttpError(404, 'Objeto no encontrado');
      const p = await ownedCharacter(tx, data.idPersonaje, user);
      await tx.lock(p, LockMode.PESSIMISTIC_WRITE);
      conflict(object.inventario?.personaje.idPersonaje !== p.idPersonaje || !!object.tienda, 'El objeto no está en tu inventario');
      const tienda = await tx.findOne(Tienda, { idTienda: data.idTienda });
      if (!tienda) throw new HttpError(404, 'Tienda no encontrada');
      const rango = rangoVenta(object.valor);
      conflict(data.precio < rango.minimo || data.precio > rango.maximo, `El precio debe estar entre ${rango.minimo} y ${rango.maximo} (70–100 % del valor)`);
      conflict(p.dinero + data.precio > 2147483647, 'El saldo excedería el límite permitido');
      p.dinero += data.precio; object.inventario = null; object.tienda = tienda; object.posicion = 0;
      await tx.flush(); return { idObjeto: object.idObjeto, idPersonaje: p.idPersonaje, dineroRestante: p.dinero, precio: data.precio };
    });
  }
}
