import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { PartidaService } from '../services/partida.service';

export function crearPartidaRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PartidaService(em);

  router.get('/', async (_req, res) => {
    try {
      const partidas = await service.obtenerTodos();
      res.json(partidas);
    } catch (error) {
      console.error('Error al obtener partidas:', error);
      res.status(500).json({ message: 'Error al obtener partidas' });
    }
  });

  return router;
}
