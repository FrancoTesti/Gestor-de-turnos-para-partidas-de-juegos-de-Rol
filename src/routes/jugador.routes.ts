import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { JugadorService } from '../services/jugador.service';

export function crearJugadorRouter(em: EntityManager): Router {
  const router = Router();
  const service = new JugadorService(em);

  router.get('/', async (_req, res) => {
    try {
      const jugadores = await service.obtenerTodos();
      res.json(jugadores);
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      res.status(500).json({ message: 'Error al obtener jugadores' });
    }
  });

  return router;
}
