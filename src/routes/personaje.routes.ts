import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { PersonajeController } from '../controllers/personaje.controller';
import { PersonajeService } from '../services/personaje.service';

export function crearPersonajeRouter(em: EntityManager): Router {
  const router = Router();
  const service = new PersonajeService(em);
  const controller = new PersonajeController(service);

  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));
  router.post('/', (req, res) => controller.crearPersonaje(req, res));
  router.put('/:id', (req, res) => controller.actualizarPersonaje(req, res));
  router.delete('/:id', (req, res) => controller.eliminarPersonaje(req, res));

  return router;
}
