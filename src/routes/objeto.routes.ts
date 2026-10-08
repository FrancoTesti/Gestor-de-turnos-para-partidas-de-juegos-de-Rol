import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ObjetoController } from '../controllers/objeto.controller';
import { ObjetoService } from '../services/objeto.service';
import { requireAnfitrion, protectObjetoModifications, requireOwnedCharacterForCompra } from '../security/authorization';

export function crearObjetoRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ObjetoService(em);
  const controller = new ObjetoController(service);

  router.get('/', (req: any, res: any) => controller.obtenerTodos(req, res));
  router.get('/sugeridos/clase/:idClase', (req: any, res: any) => controller.obtenerSugeridos(req, res));
  router.post('/:id/comprar', requireOwnedCharacterForCompra(em), (req: any, res: any) => controller.comprarObjeto(req, res));
  router.get('/:id', (req: any, res: any) => controller.obtenerPorId(req, res));
  
  router.post('/', requireAnfitrion, (req: any, res: any) => controller.crearObjeto(req, res));
  router.put('/:id', requireAnfitrion, protectObjetoModifications(em, 'id'), (req: any, res: any) => controller.actualizarObjeto(req, res));
  router.delete('/:id', requireAnfitrion, protectObjetoModifications(em, 'id'), (req: any, res: any) => controller.eliminarObjeto(req, res));

  return router;
}
