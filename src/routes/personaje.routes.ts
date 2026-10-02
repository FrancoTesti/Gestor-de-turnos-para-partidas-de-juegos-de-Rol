import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { PersonajeController } from '../controllers/personaje.controller';
import { PersonajeService } from '../services/personaje.service';
import { requireOwnJugadorForPersonaje, requireOwnedCharacterMiddleware } from '../security/authorization';

export function crearPersonajeRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PersonajeService(em);
  const controller = new PersonajeController(service);

  router.get('/', (req: any, res: any) => controller.obtenerTodos(req, res));
  router.get('/:id', (req: any, res: any) => controller.obtenerPorId(req, res));
  
  router.post('/', requireOwnJugadorForPersonaje, (req: any, res: any) => controller.crearPersonaje(req, res));
  router.put('/:id', requireOwnedCharacterMiddleware(em, 'id'), (req: any, res: any) => controller.actualizarPersonaje(req, res));
  router.delete('/:id', requireOwnedCharacterMiddleware(em, 'id'), (req: any, res: any) => controller.eliminarPersonaje(req, res));

  return router;
}
