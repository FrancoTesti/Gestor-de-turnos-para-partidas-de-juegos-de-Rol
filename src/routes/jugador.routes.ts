import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { JugadorController } from '../controllers/jugador.controller';
import { JugadorService } from '../services/jugador.service';
import { requireOwnProfile, requireCreateOwnProfile } from '../security/authorization';

export function crearJugadorRouter(em: EntityManager): Router {
  const router = Router();
  const service = new JugadorService(em);
  const controller = new JugadorController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  router.post('/', requireCreateOwnProfile, (req: any, res: any) => controller.create(req, res));
  router.put('/:id', requireOwnProfile('id'), (req: any, res: any) => controller.update(req, res));
  router.delete('/:id', requireOwnProfile('id'), (req: any, res: any) => controller.delete(req, res));

  return router;
}
