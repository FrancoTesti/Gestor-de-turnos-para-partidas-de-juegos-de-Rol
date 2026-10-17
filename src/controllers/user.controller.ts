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
  if (error instanceof NicknameInUseError) {
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
      const usuarios = await this.userService.getAll();
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
      const usuario = await this.userService.getById(id);
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
      const nuevoUsuario = await this.userService.createUser(req.body);
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
      const usuarioActualizado = await this.userService.updateUser(id, req.body);
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
      const eliminado = await this.userService.deleteUser(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      respondError(error, res, 'Error al eliminar el usuario');
    }
  }
}

export const UsuarioController = UserController;
