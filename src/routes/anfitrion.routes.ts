import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { AnfitrionController } from '../controllers/anfitrion.controller';
import { AnfitrionService } from '../services/anfitrion.service';
import { requireOwnProfile, requireCreateOwnProfile, anfitrionPutProtection } from '../security/authorization';

export function crearAnfitrionRouter(em: EntityManager): Router {
  const router = Router();
  const service = new AnfitrionService(em);
  const controller = new AnfitrionController(service);

  router.get('/', (req: any, res: any) => controller.obtenerTodos(req, res));
  router.get('/:id', (req: any, res: any) => controller.obtenerPorId(req, res));
  router.post('/', requireCreateOwnProfile, (req: any, res: any) => controller.crearAnfitrion(req, res));
  router.put('/:id', requireOwnProfile('id'), anfitrionPutProtection, (req: any, res: any) => controller.actualizarAnfitrion(req, res));
  router.delete('/:id', requireOwnProfile('id'), (req: any, res: any) => controller.eliminarAnfitrion(req, res));

  return router;
}
