import { Router } from 'express';
import { UserController, UsuarioController } from '../controllers/user.controller';
import { UserService, UsuarioService } from '../services/user.service';
import { UserRepository, UsuarioRepository } from '../repositories/user.repository';
import { EntityManager } from '@mikro-orm/core';
import { validate, validar } from '../shared/validate';
import {
  createUserSchema,
  crearUsuarioSchema,
  updateUserSchema,
  actualizarUsuarioSchema,
} from '../schemas/user.schema';
import { requireOwnUser, requireCreateUserAsAnfitrion } from '../security/authorization';

export function createUserRouter(em: EntityManager): Router {
  const router = Router();
  const userRepository = new UserRepository(em);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  router.get('/', (req: any, res: any) => userController.getAll(req, res));
  router.get('/:id', (req: any, res: any) => userController.getById(req, res));
  
  router.post('/', requireCreateUserAsAnfitrion, validate(createUserSchema), (req: any, res: any) => userController.createUser(req, res));
  router.put('/:id', requireOwnUser('id'), validate(updateUserSchema), (req: any, res: any) => userController.updateUser(req, res));
  router.delete('/:id', requireOwnUser('id'), (req: any, res: any) => userController.deleteUser(req, res));
  
  return router;
}

export const crearUsuarioRouter = createUserRouter;
