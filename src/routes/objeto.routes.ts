import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ObjetoController } from '../controllers/objeto.controller';
import { ObjetoService } from '../services/objeto.service';
import { requireAnfitrion, protectObjetoModifications, requireOwnedCharacterForCompra } from '../security/authorization';

export function crearObjetoRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ObjetoService(em);
  const controller = new ObjetoController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/sugeridos/clase/:idClase', (req: any, res: any) => controller.getSuggested(req, res));
  router.post('/:id/comprar', requireOwnedCharacterForCompra(em), (req: any, res: any) => controller.buy(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.create(req, res));
  router.put('/:id', requireAnfitrion, protectObjetoModifications(em, 'id'), (req: any, res: any) => controller.update(req, res));
  router.delete('/:id', requireAnfitrion, protectObjetoModifications(em, 'id'), (req: any, res: any) => controller.delete(req, res));

  return router;
}
