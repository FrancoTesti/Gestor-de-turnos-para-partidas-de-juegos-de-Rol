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

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor(usuarioService: UsuarioService) {
    this.usuarioService = usuarioService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await (this.usuarioService.getAll ? this.usuarioService.getAll() : this.usuarioService.obtenerTodos());
      res.json(usuarios);
    } catch (error) {
      responderError(error, res, 'Error al obtener usuarios');
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    return this.getAll(req, res);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const usuario = await (this.usuarioService.getById ? this.usuarioService.getById(id) : this.usuarioService.obtenerPorId(id));
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(usuario);
    } catch (error) {
      responderError(error, res, 'Error al obtener el usuario');
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    return this.getById(req, res);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      /* Con el middleware de Zod, req.body ya viene validado, tipado y limpio.
      Ya no necesitamos llamar a la funcion manual de validación aca */
      const createFn = this.usuarioService.create ? this.usuarioService.create.bind(this.usuarioService) : this.usuarioService.crearUsuario.bind(this.usuarioService);
      const nuevoUsuario = await createFn(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      responderError(error, res, 'Error al crear el usuario');
    }
  }

  async crearUsuario(req: Request, res: Response): Promise<void> {
    return this.create(req, res);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      // Gracias al middleware de Zod, req.body ya viene validado, tipado y limpio.
      // Le pasamos el req.body directamente al servicio
      const updateFn = this.usuarioService.update ? this.usuarioService.update.bind(this.usuarioService) : this.usuarioService.actualizarUsuario.bind(this.usuarioService);
      const usuarioActualizado = await updateFn(id, req.body);
      if (!usuarioActualizado) {
        res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
        return;
      }

      res.json(usuarioActualizado);
    } catch (error) {
      responderError(error, res, 'Error al actualizar el usuario');
    }
  }

  async actualizarUsuario(req: Request, res: Response): Promise<void> {
    return this.update(req, res);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const deleteFn = this.usuarioService.delete ? this.usuarioService.delete.bind(this.usuarioService) : this.usuarioService.eliminarUsuario.bind(this.usuarioService);
      const eliminado = await deleteFn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar el usuario');
    }
  }

  async eliminarUsuario(req: Request, res: Response): Promise<void> {
    return this.delete(req, res);
  }
  // (aca termina la clase UsuarioController)
}

function obtenerId(idParam: string | string[] | undefined): number | null {
  const str = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!str || !/^\d+$/.test(str)) return null;
  const id = Number(str);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}


