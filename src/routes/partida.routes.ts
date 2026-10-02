import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { PartidaController } from '../controllers/partida.controller';
import { PartidaService } from '../services/partida.service';
import { requireAnfitrionForPartida, requireHostedGameMiddleware } from '../security/authorization';

export function crearPartidaRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PartidaService(em);
  const controller = new PartidaController(service);

  router.get('/', (req: any, res: any) => controller.obtenerTodas(req, res));
  router.get('/:id', (req: any, res: any) => controller.obtenerPorId(req, res));
  
  router.post('/', requireAnfitrionForPartida, (req: any, res: any) => controller.crearPartida(req, res));
  router.put('/:id', requireHostedGameMiddleware(em, 'id'), (req: any, res: any) => controller.actualizarPartida(req, res));
  router.delete('/:id', requireHostedGameMiddleware(em, 'id'), (req: any, res: any) => controller.eliminarPartida(req, res));

  return router;
}
