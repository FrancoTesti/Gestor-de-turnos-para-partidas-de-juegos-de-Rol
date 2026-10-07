import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { JuegoService, inventoryDTO, missionDTO, sessionDTO } from '../services/juego.service';
import { Inventario } from '../entities/Inventario.entity';
import { Sesion } from '../entities/Sesion.entity';
import { Mision } from '../entities/Mision.entity';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';
import { Objeto } from '../entities/Objeto.entity';
import { HttpError, ownedCharacter, routeId } from '../security/authorization';
import { ObjetoService } from '../services/objeto.service';
import { Personaje } from '../entities/Personaje.entity';
import { Jugador } from '../entities/Jugador.entity';
import { rangoVenta } from '../services/venta.rules';

export function crearJuegoRouter(em: EntityManager) {
  const r = Router();
  const service = new JuegoService(em);
  r.get('/sesiones', async (_req, res) => res.json((await em.find(Sesion, {}, { populate: ['partida'] })).map(sessionDTO)));
  r.get('/sesiones/:game/:number', async (req, res) => {
    const s = await em.findOne(Sesion, { partida: { idPartida: routeId(req.params.game) }, numSesion: routeId(req.params.number) }, { populate: ['partida'] });
    if (!s) throw new HttpError(404, 'Sesión no encontrada');
    const participants = await em.find(PersonajeSesion, { sesion: s }, { populate: ['personaje'] });
    res.json({ ...sessionDTO(s), participantes: participants.map(p => ({ idPersonaje: p.personaje.idPersonaje, nombre: p.personaje.nombreFicticio, dioKarma: p.dioKarma })) });
  });
  r.post('/sesiones', async (req, res) => res.status(201).json(await service.saveSession(req.identity!.idUsuario, req.body)));
  r.put('/sesiones/:game/:number', async (req, res) => res.json(await service.saveSession(req.identity!.idUsuario, { ...req.body, idPartida: routeId(req.params.game), numSesion: routeId(req.params.number) }, true)));
  r.delete('/sesiones/:game/:number', async (req, res) => { await service.deleteSession(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number)); res.sendStatus(204); });
  r.post('/sesiones/:game/:number/jugar', async (req, res) => res.json(await service.play(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), req.body)));
  r.post('/sesiones/:game/:number/finalizar', async (req, res) => res.json(await service.finish(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number))));
  r.post('/sesiones/:game/:number/calificar', async (req, res) => res.json(await service.rate(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), req.body)));
  r.get('/misiones', async (_req, res) => res.json((await em.find(Mision, {}, { populate: ['sesion.partida'] })).map(missionDTO)));
  r.get('/misiones/:game/:number/:mission', async (req, res) => {
    const m = await em.findOne(Mision, { sesion: { partida: { idPartida: routeId(req.params.game) }, numSesion: routeId(req.params.number) }, numMision: routeId(req.params.mission) }, { populate: ['sesion.partida'] });
    if (!m) throw new HttpError(404, 'Misión no encontrada'); res.json(missionDTO(m));
  });
  r.post('/misiones', async (req, res) => res.status(201).json(await service.saveMission(req.identity!.idUsuario, req.body)));
  r.put('/misiones/:game/:number/:mission', async (req, res) => res.json(await service.saveMission(req.identity!.idUsuario, { ...req.body, idPartida: routeId(req.params.game), numSesion: routeId(req.params.number), numMision: routeId(req.params.mission) }, true)));
  r.delete('/misiones/:game/:number/:mission', async (req, res) => { await service.deleteMission(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), routeId(req.params.mission)); res.sendStatus(204); });
  r.post('/misiones/:game/:number/:mission/completar', async (req, res) => res.json(await service.completeMission(req.identity!.idUsuario, routeId(req.params.game), routeId(req.params.number), routeId(req.params.mission), req.body)));
  r.get('/inventarios', async (req, res) => {
    const jugador = await em.findOne(Jugador, { usuario: { idUsuario: req.identity!.idUsuario } });
    if (!jugador) { res.json([]); return; }
    const personajes = await em.find(Personaje, { jugador });
    if (!personajes.length) { res.json([]); return; }
    res.json((await em.find(Inventario, { personaje: { $in: personajes } }, { populate: ['personaje'] })).map(inventoryDTO));
  });
  r.get('/inventarios/:character/:number', async (req, res) => {
    const p = await ownedCharacter(em, routeId(req.params.character), req.identity!.idUsuario);
    const i = await em.findOne(Inventario, { personaje: p, numInventario: routeId(req.params.number) });
    if (!i) throw new HttpError(404, 'Inventario no encontrado');
    const objetos = await em.find(Objeto, { inventario: i });
    res.json({ ...inventoryDTO(i), objetos: objetos.map(o => ({ idObjeto: o.idObjeto, nombre: o.nombre, posicion: o.posicion, valor: o.valor, ...rangoVenta(o.valor) })) });
  });
  r.post('/inventarios', async (req, res) => res.status(201).json(await service.saveInventory(req.identity!.idUsuario, req.body)));
  r.put('/inventarios/:character/:number', async (req, res) => res.json(await service.saveInventory(req.identity!.idUsuario, { ...req.body, idPersonaje: routeId(req.params.character), numInventario: routeId(req.params.number) }, true)));
  r.delete('/inventarios/:character/:number', async (req, res) => { await service.deleteInventory(req.identity!.idUsuario, routeId(req.params.character), routeId(req.params.number)); res.sendStatus(204); });
  r.post('/inventarios/:character/:number/mover', async (req, res) => res.json(await service.moveObject(req.identity!.idUsuario, routeId(req.params.character), routeId(req.params.number), req.body)));
  r.post('/objetos/:id/vender', async (req, res) => res.json(await service.sell(req.identity!.idUsuario, routeId(req.params.id), req.body)));
  r.get('/objetos/sugeridos/:character', async (req, res) => {
    const p = await ownedCharacter(em, routeId(req.params.character), req.identity!.idUsuario);
    res.json(await new ObjetoService(em).obtenerSugeridos(p.clase.idClase));
  });
  return r;
}
