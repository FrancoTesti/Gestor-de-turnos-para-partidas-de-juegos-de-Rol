// mapea las URLs del modulo sesion a los metodos del controller.
import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { SesionController } from '../controllers/sesion.controller';
import { SesionService } from '../services/sesion.service';

export function crearSesionRouter(em: EntityManager): Router {
  const router = Router();

  const service = new SesionService(em);
  const controller = new SesionController(service);

  // GET /api/sesiones?idPartida=X  , todas las sesiones de una partida
  router.get('/', (req, res) => controller.obtenerPorPartida(req, res));

  // GET /api/sesiones/:idPartida/:numSesion  , una sesion especifica
  router.get('/:idPartida/:numSesion', (req, res) => controller.obtenerPorId(req, res));

  // POST /api/sesiones  — crear sesión
  router.post('/', (req, res) => controller.crearSesion(req, res));

  // PUT /api/sesiones/:idPartida/:numSesion  — actualizar (cambiar estado, etc.)
  router.put('/:idPartida/:numSesion', (req, res) => controller.actualizarSesion(req, res));

  // DELETE /api/sesiones/:idPartida/:numSesion  — eliminar
  router.delete('/:idPartida/:numSesion', (req, res) => controller.eliminarSesion(req, res));

    // GET /api/sesiones/:idPartida/:numSesion/participantes — listar participantes
  router.get('/:idPartida/:numSesion/participantes', (req, res) => controller.obtenerParticipantes(req, res));

  // POST /api/sesiones/:idPartida/:numSesion/participantes — agregar participante
  router.post('/:idPartida/:numSesion/participantes', (req, res) => controller.agregarParticipante(req, res));
  
  // POST /api/sesiones/:idPartida/:numSesion/karma  — calificar al anfitrión
  router.post('/:idPartida/:numSesion/karma', (req, res) => controller.darKarma(req, res));

   
  
  return router;
}