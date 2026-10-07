import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { ClaseController } from '../controllers/clase.controller';
import { ClaseService } from '../services/clase.service';

export function crearClaseRouter(em: EntityManager): Router {
  const router = Router();
  const service = new ClaseService(em);
  const controller = new ClaseController(service);

  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));
  router.post('/', (req, res) => controller.crearClase(req, res));
  router.put('/:id', (req, res) => controller.actualizarClase(req, res));
  router.delete('/:id', (req, res) => controller.eliminarClase(req, res));

  return router;
}
