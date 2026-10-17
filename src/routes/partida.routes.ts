import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { PartidaController } from '../controllers/partida.controller';
import { PartidaService } from '../services/partida.service';
import { requireAnfitrionForPartida, requireHostedGameMiddleware } from '../security/authorization';

export function crearPartidaRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PartidaService(em);
  const controller = new PartidaController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  
  router.post('/', requireAnfitrionForPartida, (req: any, res: any) => controller.create(req, res));
  router.put('/:id', requireHostedGameMiddleware(em, 'id'), (req: any, res: any) => controller.update(req, res));
  router.delete('/:id', requireHostedGameMiddleware(em, 'id'), (req: any, res: any) => controller.delete(req, res));

  return router;
}
