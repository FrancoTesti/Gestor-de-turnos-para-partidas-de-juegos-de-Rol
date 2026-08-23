// mapea las URLs del modulo Anfitrion a los metodos del controller.
import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { AnfitrionController } from '../controllers/anfitrion.controller';
import { AnfitrionService } from '../services/anfitrion.service';

export function crearAnfitrionRouter(em: EntityManager): Router {
  const router = Router();

  // inyeccion de dependencias
  const service = new AnfitrionService(em);
  const controller = new AnfitrionController(service);

  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req as any, res));
  router.post('/', (req, res) => controller.crearAnfitrion(req, res));
  router.put('/:id', (req, res) => controller.actualizarAnfitrion(req as any, res));
  router.delete('/:id', (req, res) => controller.eliminarAnfitrion(req as any, res));

  return router;
}