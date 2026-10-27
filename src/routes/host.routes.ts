import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { HostController } from '../controllers/host.controller';
import { HostService } from '../services/host.service';
import { requireOwnProfile, requireCreateOwnProfile, anfitrionPutProtection } from '../security/authorization';

export function createHostRouter(em: EntityManager): Router {
  const router = Router();
  const service = new HostService(em);
  const controller = new HostController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  router.post('/', requireCreateOwnProfile, (req: any, res: any) => controller.createHost(req, res));
  router.put('/:id', requireOwnProfile('id'), anfitrionPutProtection);
  router.delete('/:id', requireOwnProfile('id'), (req: any, res: any) => controller.deleteHost(req, res));

  return router;
}

export const crearAnfitrionRouter = createHostRouter;
