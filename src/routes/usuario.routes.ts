import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService } from '../services/usuario.service';
import { EntityManager } from '@mikro-orm/core';

export function crearUsuarioRouter(em: EntityManager): Router {
  const router = Router();
  
  // Instanciamos las capas inyectando las dependencias
  const usuarioService = new UsuarioService(em);
  const usuarioController = new UsuarioController(usuarioService);

  // Vinculamos los endpoints HTTP con los métodos del controlador
  router.get('/', (req, res) => usuarioController.obtenerTodos(req, res));
  router.get('/:id', (req, res) => usuarioController.obtenerPorId(req, res));
  router.post('/', (req, res) => usuarioController.crearUsuario(req, res));
  router.put('/:id', (req, res) => usuarioController.actualizarUsuario(req, res));
  router.delete('/:id', (req, res) => usuarioController.eliminarUsuario(req, res));

  return router;
}