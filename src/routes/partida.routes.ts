// mapea las URLs del modulo Partida a los métodos del controller.
import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { PartidaController } from '../controllers/partida.controller';
import { PartidaService } from '../services/partida.service';

export function crearPartidaRouter(em: EntityManager): Router {
  const router = Router();

  // Inyección de dependencias
  const service = new PartidaService(em);
  const controller = new PartidaController(service);

  router.get('/', (req, res) => controller.obtenerTodas(req, res));

  // /activas SIEMPRE antes que /:id — si no, Express trata "activas" como un ID
  router.get('/activas', (req, res) => controller.obtenerActivas(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req as any, res));

  router.post('/', (req, res) => controller.crearPartida(req, res));
  router.put('/:id', (req, res) => controller.actualizarPartida(req as any, res));
  router.delete('/:id', (req, res) => controller.eliminarPartida(req as any, res));

  return router;
}