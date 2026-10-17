import { type Request, type Response } from 'express';
import { NicknameInUseError, NicknameEnUsoError, UserService, UsuarioService } from '../services/user.service';
import { ForeignKeyConstraintViolationException } from '@mikro-orm/core';

type IdParams = {
  id: string;
};

function respondError(error: unknown, res: Response, mensajeInterno: string): void {
  if (error instanceof ForeignKeyConstraintViolationException) {
    res.status(409).json({ message: 'La cuenta tiene personajes o partidas relacionados. Resolvé esas relaciones antes de eliminarla.' });
    return;
  }
  if (error instanceof NicknameInUseError || error instanceof NicknameEnUsoError) {
    res.status(409).json({ message: error.message });
    return;
  }

  console.error(mensajeInterno, error);
  res.status(500).json({ message: mensajeInterno });
}

export const responderError = respondError;

function getId(idParam: string | string[] | undefined): number | null {
  const str = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!str || !/^\d+$/.test(str)) return null;
  const id = Number(str);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const fn = (this.userService.getAll ?? this.userService.obtenerTodos).bind(this.userService);
      const usuarios = await fn();
      res.json(usuarios);
    } catch (error) {
      respondError(error, res, 'Error al obtener usuarios');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const fn = (this.userService.getById ?? this.userService.obtenerPorId).bind(this.userService);
      const usuario = await fn(id);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(usuario);
    } catch (error) {
      respondError(error, res, 'Error al obtener el usuario');
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const fn = (this.userService.createUser ?? this.userService.crearUsuario).bind(this.userService);
      const nuevoUsuario = await fn(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      respondError(error, res, 'Error al crear el usuario');
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const fn = (this.userService.updateUser ?? this.userService.actualizarUsuario).bind(this.userService);
      const usuarioActualizado = await fn(id, req.body);
      if (!usuarioActualizado) {
        res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
        return;
      }

      res.json(usuarioActualizado);
    } catch (error) {
      respondError(error, res, 'Error al actualizar el usuario');
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const fn = (this.userService.deleteUser ?? this.userService.eliminarUsuario).bind(this.userService);
      const eliminado = await fn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      respondError(error, res, 'Error al eliminar el usuario');
    }
  }

  obtenerTodos = this.getAll.bind(this);
  obtenerPorId = this.getById.bind(this);
  crearUsuario = this.createUser.bind(this);
  actualizarUsuario = this.updateUser.bind(this);
  eliminarUsuario = this.deleteUser.bind(this);
}

export const UsuarioController = UserController;
