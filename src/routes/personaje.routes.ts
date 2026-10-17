import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { PersonajeController } from '../controllers/personaje.controller';
import { PersonajeService } from '../services/personaje.service';
import { requireOwnJugadorForPersonaje, requireOwnedCharacterMiddleware } from '../security/authorization';

export function crearPersonajeRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PersonajeService(em);
  const controller = new PersonajeController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  
  router.post('/', requireOwnJugadorForPersonaje, (req: any, res: any) => controller.create(req, res));
  router.put('/:id', requireOwnedCharacterMiddleware(em, 'id'), (req: any, res: any) => controller.update(req, res));
  router.delete('/:id', requireOwnedCharacterMiddleware(em, 'id'), (req: any, res: any) => controller.delete(req, res));

  return router;
}
