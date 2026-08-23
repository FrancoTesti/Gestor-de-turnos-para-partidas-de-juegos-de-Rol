import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { EntityManager } from '@mikro-orm/core';
import { validar } from '../shared/validar';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/usuario.schema';

// capa Routes: La "puerta de entrada" a la API. Mapea las URLs.
export function crearUsuarioRouter(em: EntityManager): Router {
  const router = Router();
  
  // inyeccion de dependencias: Armamos la cadena pasandole a cada capa lo que necesita.
  const usuarioRepository = new UsuarioRepository(em); // el repo recibe la BD
  const usuarioService = new UsuarioService(usuarioRepository); // el service recibe el Repo
  const usuarioController = new UsuarioController(usuarioService); // el controller recibe el Service

  // vinculamos cada endpoint HTTP con el metodo del controlador correspondiente.
  // Usar arrow functions (req, res) => ... soluciona el "bug de pérdida de this" de Express.
  router.get('/', (req, res) => usuarioController.obtenerTodos(req, res));
  router.get('/:id', (req, res) => usuarioController.obtenerPorId(req as any, res));
  
  // Usamos el middleware "validar" ANTES de llegar al controlador
  router.post('/', validar(crearUsuarioSchema), (req, res) => usuarioController.crearUsuario(req, res));
  router.put('/:id', validar(actualizarUsuarioSchema), (req, res) => usuarioController.actualizarUsuario(req as any, res));
  
  router.delete('/:id', (req, res) => usuarioController.eliminarUsuario(req as any, res));
  return router;
} 