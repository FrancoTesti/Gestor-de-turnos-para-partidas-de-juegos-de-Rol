/* mapea las URLs del modulo Jugador a los metodos del controller.
Esta función se llama desde app.ts y recibe el EntityManager de MikroORM */
import { EntityManager } from '@mikro-orm/core';
import { Router } from 'express';
import { JugadorController } from '../controllers/jugador.controller';
import { JugadorService } from '../services/jugador.service';

export function crearJugadorRouter(em: EntityManager): Router {
  const router = Router();

  // inyeccion de dependencias: cada capa recibe lo que necesita de la capa anterior
  const service = new JugadorService(em);          // service recibe la BD
  const controller = new JugadorController(service); // controller recibe el service

  // uso arrow functions para evitar el bug de perdida de "this" de Express
  router.get('/', (req, res) => controller.obtenerTodos(req, res));
  router.get('/:id', (req, res) => controller.obtenerPorId(req, res));
  router.post('/', (req, res) => controller.crearJugador(req, res));
  router.put('/:id', (req, res) => controller.actualizarJugador(req, res));
  router.delete('/:id', (req, res) => controller.eliminarJugador(req, res));

  return router;
}