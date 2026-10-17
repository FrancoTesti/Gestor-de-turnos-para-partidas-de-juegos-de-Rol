import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { EntityManager } from '@mikro-orm/core';
import { validar } from '../shared/validar';
import { crearUsuarioSchema, actualizarUsuarioSchema } from '../schemas/usuario.schema';
import { requireOwnUser, requireCreateUserAsAnfitrion } from '../security/authorization';

export function crearUsuarioRouter(em: EntityManager): Router {
  const router = Router();
  const usuarioRepository = new UsuarioRepository(em);
  const usuarioService = new UsuarioService(usuarioRepository);
  const usuarioController = new UsuarioController(usuarioService);

  router.get('/', (req: any, res: any) => usuarioController.getAll(req, res));
  router.get('/:id', (req: any, res: any) => usuarioController.getById(req, res));
  
  router.post('/', requireCreateUserAsAnfitrion, validar(crearUsuarioSchema), (req: any, res: any) => usuarioController.create(req, res));
  router.put('/:id', requireOwnUser('id'), validar(actualizarUsuarioSchema), (req: any, res: any) => usuarioController.update(req, res));
  router.delete('/:id', requireOwnUser('id'), (req: any, res: any) => usuarioController.delete(req, res));
  
  return router;
}
