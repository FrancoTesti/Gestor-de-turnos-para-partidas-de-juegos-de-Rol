import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ItemController, ObjetoController } from '../controllers/item.controller';
import { ItemService, ObjetoService } from '../services/item.service';
import { requireAnfitrion, protectObjetoModifications, requireOwnedCharacterForCompra } from '../security/authorization';

export function createItemRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ItemService(em);
  const controller = new ItemController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/sugeridos/clase/:idClase', (req: any, res: any) => controller.getSuggestedItems(req, res));
  router.post('/:id/comprar', requireOwnedCharacterForCompra(em), (req: any, res: any) => controller.buyItem(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.createItem(req, res));
  router.put('/:id', requireAnfitrion, protectObjetoModifications(em, 'id'), (req: any, res: any) => controller.updateItem(req, res));
  router.delete('/:id', requireAnfitrion, protectObjetoModifications(em, 'id'), (req: any, res: any) => controller.deleteItem(req, res));

  return router;
}

export const crearObjetoRouter = createItemRouter;
