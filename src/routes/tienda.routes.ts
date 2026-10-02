import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { TiendaController } from '../controllers/tienda.controller';
import { TiendaService } from '../services/tienda.service';
import { requireAnfitrion } from '../security/authorization';

export function crearTiendaRouter(em: EntityManager): Router {
  const router = Router();
  const service = new TiendaService(em);
  const controller = new TiendaController(service);

  router.get('/', (req: any, res: any) => controller.obtenerTodos(req, res));
  router.get('/:id', (req: any, res: any) => controller.obtenerPorId(req, res));
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.crearTienda(req, res));
  router.put('/:id', requireAnfitrion, (req: any, res: any) => controller.actualizarTienda(req, res));
  router.delete('/:id', requireAnfitrion, (req: any, res: any) => controller.eliminarTienda(req, res));

  return router;
}
