import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ObjetoController } from '../controllers/objeto.controller';
import { ObjetoService } from '../services/objeto.service';

export function crearObjetoRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ObjetoService(em);
  const controller = new ObjetoController(service);

  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.post('/:id/comprar', (req, res) => controller.comprarObjeto(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));
  router.post('/', (req, res) => controller.crearObjeto(req, res));
  router.put('/:id', (req, res) => controller.actualizarObjeto(req, res));
  router.delete('/:id', (req, res) => controller.eliminarObjeto(req, res));

  return router;
}
