import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { PlayerController, JugadorController } from '../controllers/player.controller';
import { PlayerService, JugadorService } from '../services/player.service';
import { requireOwnProfile, requireCreateOwnProfile } from '../security/authorization';

export function createPlayerRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PlayerService(em);
  const controller = new PlayerController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  router.post('/', requireCreateOwnProfile, (req: any, res: any) => controller.createPlayer(req, res));
  router.put('/:id', requireOwnProfile('id'), (req: any, res: any) => controller.updatePlayer(req, res));
  router.delete('/:id', requireOwnProfile('id'), (req: any, res: any) => controller.deletePlayer(req, res));

  return router;
}

export const crearJugadorRouter = createPlayerRouter;
