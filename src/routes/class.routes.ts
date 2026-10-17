import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ClassController, ClaseController } from '../controllers/class.controller';
import { ClassService, ClaseService } from '../services/class.service';
import { requireAnfitrion } from '../security/authorization';

export function createClassRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ClassService(em);
  const controller = new ClassController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.createClass(req, res));
  router.put('/:id', requireAnfitrion, (req: any, res: any) => controller.updateClass(req, res));
  router.delete('/:id', requireAnfitrion, (req: any, res: any) => controller.deleteClass(req, res));

  return router;
}

export const crearClaseRouter = createClassRouter;
