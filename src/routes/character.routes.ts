import { Router } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { CharacterController, PersonajeController } from '../controllers/character.controller';
import { CharacterService, PersonajeService } from '../services/character.service';
import { requireOwnJugadorForPersonaje, requireOwnedCharacterMiddleware } from '../security/authorization';

export function createCharacterRouter(em: EntityManager): Router {
  const router = Router();
  const service = new CharacterService(em);
  const controller = new CharacterController(service);

  router.get('/', (req: any, res: any) => controller.getAll(req, res));
  router.get('/:id', (req: any, res: any) => controller.getById(req, res));
  
  router.post('/', requireOwnJugadorForPersonaje, (req: any, res: any) => controller.createCharacter(req, res));
  router.put('/:id', requireOwnedCharacterMiddleware(em, 'id'), (req: any, res: any) => controller.updateCharacter(req, res));
  router.delete('/:id', requireOwnedCharacterMiddleware(em, 'id'), (req: any, res: any) => controller.deleteCharacter(req, res));

  return router;
}

export const crearPersonajeRouter = createCharacterRouter;
