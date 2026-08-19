import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { TiendaController } from '../controllers/tienda.controller';
import { TiendaService } from '../services/tienda.service';

export function crearTiendaRouter(em: EntityManager): Router {
  const router = Router();
  const service = new TiendaService(em);
  const controller = new TiendaController(service);

  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));
  router.post('/', (req, res) => controller.crearTienda(req, res));
  router.put('/:id', (req, res) => controller.actualizarTienda(req, res));
  router.delete('/:id', (req, res) => controller.eliminarTienda(req, res));

  return router;
}
