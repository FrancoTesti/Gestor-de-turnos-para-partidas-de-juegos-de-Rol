import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { ShopController, TiendaController } from '../controllers/shop.controller';
import { ShopService, TiendaService } from '../services/shop.service';
import { requireAnfitrion } from '../security/authorization';

export function createShopRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ShopService(em);
  const controller = new ShopController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.createShop(req, res));
  router.put('/:id', requireAnfitrion, (req: any, res: any) => controller.updateShop(req, res));
  router.delete('/:id', requireAnfitrion, (req: any, res: any) => controller.deleteShop(req, res));

  return router;
}

export const crearTiendaRouter = createShopRouter;
