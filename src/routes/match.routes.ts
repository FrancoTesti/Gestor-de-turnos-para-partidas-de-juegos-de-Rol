import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { MatchController, PartidaController } from '../controllers/match.controller';
import { MatchService, PartidaService } from '../services/match.service';
import { requireAnfitrionForPartida, requireHostedGameMiddleware } from '../security/authorization';

export function createMatchRouter(em: EntityManager): Router {
  const router = Router();
  const service = new MatchService(em);
  const controller = new MatchController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/activas', (req: any, res: any) => controller.getActive(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  
  router.post('/', requireAnfitrionForPartida, (req: any, res: any) => controller.createMatch(req, res));
  router.put('/:id', requireHostedGameMiddleware(em, 'id'), (req: any, res: any) => controller.updateMatch(req, res));
  router.delete('/:id', requireHostedGameMiddleware(em, 'id'), (req: any, res: any) => controller.deleteMatch(req, res));

  return router;
}

export const crearPartidaRouter = createMatchRouter;
