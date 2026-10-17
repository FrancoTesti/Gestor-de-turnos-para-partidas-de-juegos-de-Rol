import { type Request, type Response } from 'express';
import { NicknameEnUsoError, UsuarioService } from '../services/usuario.service';
import { ForeignKeyConstraintViolationException } from '@mikro-orm/core';

type IdParams = {
  id: string;
};

function responderError(error: unknown, res: Response, mensajeInterno: string): void {
  if (error instanceof ForeignKeyConstraintViolationException) { res.status(409).json({ message: 'La cuenta tiene personajes o partidas relacionados. Resolvé esas relaciones antes de eliminarla.' }); return; }
  if (error instanceof NicknameEnUsoError) {
    res.status(409).json({ message: error.message });
    return;
  }

  console.error(mensajeInterno, error);
  res.status(500).json({ message: mensajeInterno });
}

function obtenerId(idParam: string | string[] | undefined): number | null {
  const str = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!str || !/^\d+$/.test(str)) return null;
  const id = Number(str);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor(usuarioService: UsuarioService) {
    this.usuarioService = usuarioService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.usuarioService.getAll();
      res.json(usuarios);
    } catch (error) {
      responderError(error, res, 'Error al obtener usuarios');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const usuario = await this.usuarioService.getById(id);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(usuario);
    } catch (error) {
      responderError(error, res, 'Error al obtener el usuario');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const nuevoUsuario = await this.usuarioService.create(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      responderError(error, res, 'Error al crear el usuario');
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const usuarioActualizado = await this.usuarioService.update(id, req.body);
      if (!usuarioActualizado) {
        res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
        return;
      }

      res.json(usuarioActualizado);
    } catch (error) {
      responderError(error, res, 'Error al actualizar el usuario');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.usuarioService.delete(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar el usuario');
    }
  }
}
