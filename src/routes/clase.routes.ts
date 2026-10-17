import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ClaseController } from '../controllers/clase.controller';
import { ClaseService } from '../services/clase.service';
import { requireAnfitrion } from '../security/authorization';

export function crearClaseRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ClaseService(em);
  const controller = new ClaseController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.create(req, res));
  router.put('/:id', requireAnfitrion, (req: any, res: any) => controller.update(req, res));
  router.delete('/:id', requireAnfitrion, (req: any, res: any) => controller.delete(req, res));

  return router;
}
