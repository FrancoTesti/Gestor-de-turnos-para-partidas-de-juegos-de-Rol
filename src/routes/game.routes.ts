import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { GameService, JuegoService, inventoryDTO, missionDTO, sessionDTO } from '../services/game.service';
import { Inventory, Inventario } from '../entities/Inventory.entity';
import { Session, Sesion } from '../entities/Session.entity';
import { Mission, Mision } from '../entities/Mission.entity';
import { CharacterSession, PersonajeSesion } from '../entities/CharacterSession.entity';
import { Item, Objeto } from '../entities/Item.entity';
import { HttpError, ownedCharacter, routeId } from '../security/authorization';
import { ItemService, ObjetoService } from '../services/item.service';
import { Character, Personaje } from '../entities/Character.entity';
import { Player, Jugador } from '../entities/Player.entity';
import { saleRange, rangoVenta } from '../services/sale.rules';

export function createGameRouter(em: EntityManager) {
  const r = Router();
  const service = new GameService(em);
  r.get('/sesiones', async (_req, res) => res.json((await em.find(Session, {}, { populate: ['partida'] })).map(sessionDTO)));
  r.get('/sesiones/:game/:number', async (req: any, res: any) => {
    const s = await em.findOne(Session, { partida: { idPartida: routeId(req.params.game) }, numSesion: routeId(req.params.number) }, { populate: ['partida'] });
    if (!s) throw new HttpError(404, 'Sesión no encontrada');
    const participants = await em.find(CharacterSession, { sesion: s }, { populate: ['personaje'] });
    res.json({ ...sessionDTO(s), participantes: participants.map(p => ({ idPersonaje: p.personaje.idPersonaje, nombre: p.personaje.nombreFicticio, dioKarma: p.dioKarma })) });
  });
  r.post('/sesiones', async (req: any, res: any) => res.status(201).json(await service.saveSession(req.identity!.idUsuario, req.body)));
  r.put('/sesiones/:game/:number', async (req: any, res: any) => res.json(await service.saveSession(req.identity!.idUsuario, { ...req.body, idPartida: routeId(req.params.game), numSesion: routeId(req.params.number) }, true)));
  r.delete('/sesiones/:game/:number', async (req: any, res: any) => { await service.deleteSession(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number)); res.sendStatus(204); });
  r.post('/sesiones/:game/:number/jugar', async (req: any, res: any) => res.json(await service.play(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), req.body)));
  r.post('/sesiones/:game/:number/finalizar', async (req: any, res: any) => res.json(await service.finish(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number))));
  r.post('/sesiones/:game/:number/calificar', async (req: any, res: any) => res.json(await service.rate(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), req.body)));
  r.get('/misiones', async (_req, res) => res.json((await em.find(Mission, {}, { populate: ['sesion.partida'] })).map(missionDTO)));
  r.get('/misiones/:game/:number/:mission', async (req: any, res: any) => {
    const m = await em.findOne(Mission, { sesion: { partida: { idPartida: routeId(req.params.game) }, numSesion: routeId(req.params.number) }, numMision: routeId(req.params.mission) }, { populate: ['sesion.partida'] });
    if (!m) throw new HttpError(404, 'Misión no encontrada'); res.json(missionDTO(m));
  });
  r.post('/misiones', async (req: any, res: any) => res.status(201).json(await service.saveMission(req.identity!.idUsuario, req.body)));
  r.put('/misiones/:game/:number/:mission', async (req: any, res: any) => res.json(await service.saveMission(req.identity!.idUsuario, { ...req.body, idPartida: routeId(req.params.game), numSesion: routeId(req.params.number), numMision: routeId(req.params.mission) }, true)));
  r.delete('/misiones/:game/:number/:mission', async (req: any, res: any) => { await service.deleteMission(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), routeId(req.params.mission)); res.sendStatus(204); });
  r.post('/misiones/:game/:number/:mission/completar', async (req: any, res: any) => res.json(await service.completeMission(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), routeId(req.params.mission), req.body)));
  r.get('/inventarios', async (req: any, res: any) => {
    const jugador = await em.findOne(Player, { usuario: { idUsuario: req.identity!.idUsuario } });
    if (!jugador) { res.json([]); return; }
    const personajes = await em.find(Character, { jugador });
    if (!personajes.length) { res.json([]); return; }
    res.json((await em.find(Inventory, { personaje: { $in: personajes } }, { populate: ['personaje'] })).map(inventoryDTO));
  });
  r.get('/inventarios/:character/:number', async (req: any, res: any) => {
    const p = await ownedCharacter(em, routeId(req.params.character), req.identity!.idUsuario);
    const i = await em.findOne(Inventory, { personaje: p, numInventario: routeId(req.params.number) });
    if (!i) throw new HttpError(404, 'Inventario no encontrado');
    const objetos = await em.find(Item, { inventario: i });
    res.json({ ...inventoryDTO(i), objetos: objetos.map(o => ({ idObjeto: o.idObjeto, nombre: o.nombre, posicion: o.posicion, valor: o.valor, ...saleRange(o.valor) })) });
  });
  r.post('/inventarios', async (req: any, res: any) => res.status(201).json(await service.saveInventory(req.identity!.idUsuario, req.body)));
  r.put('/inventarios/:character/:number', async (req: any, res: any) => res.json(await service.saveInventory(req.identity!.idUsuario, { ...req.body, idPersonaje: routeId(req.params.character), numInventario: routeId(req.params.number) }, true)));
  r.delete('/inventarios/:character/:number', async (req: any, res: any) => { await service.deleteInventory(req.identity!.idUsuario, routeId(req.params.character), routeId(req.params.number)); res.sendStatus(204); });
  r.post('/inventarios/:character/:number/mover', async (req: any, res: any) => res.json(await service.moveObject(req.identity!.idUsuario, routeId(req.params.character), routeId(req.params.number), req.body)));
  r.post('/objetos/:id/vender', async (req: any, res: any) => res.json(await service.sell(req.identity!.idUsuario, routeId(req.params.id), req.body)));
  r.get('/objetos/sugeridos/:character', async (req: any, res: any) => {
    const p = await ownedCharacter(em, routeId(req.params.character), req.identity!.idUsuario);
    res.json(await new ItemService(em).getSuggestedItems(p.clase.idClase));
  });
  return r;
}

export const crearJuegoRouter = createGameRouter;
