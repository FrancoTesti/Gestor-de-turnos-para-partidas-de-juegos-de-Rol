import { type Request, type Response } from 'express';
import { NicknameEnUsoError, UsuarioService } from '../services/usuario.service';

type IdParams = {
  id: string;
};

function responderError(error: unknown, res: Response, mensajeInterno: string): void {
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

  async obtenerTodos(_req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await this.usuarioService.obtenerTodos();
      res.json(usuarios);
    } catch (error) {
      responderError(error, res, 'Error al obtener usuarios');
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const usuario = await this.usuarioService.obtenerPorId(id);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(usuario);
    } catch (error) {
      responderError(error, res, 'Error al obtener el usuario');
    }
  }

  async crearUsuario(req: Request, res: Response): Promise<void> {
    try {
      /* Con el middleware de Zod, req.body ya viene validado, tipado y limpio.
      Ya no necesitamos llamar a la funcion manual de validación aca */
      const nuevoUsuario = await this.usuarioService.crearUsuario(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      responderError(error, res, 'Error al crear el usuario');
    }
  }

  async actualizarUsuario(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      // Gracias al middleware de Zod, req.body ya viene validado, tipado y limpio.
      // Le pasamos el req.body directamente al servicio
      const usuarioActualizado = await this.usuarioService.actualizarUsuario(id, req.body);
      if (!usuarioActualizado) {
        res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
        return;
      }

      res.json(usuarioActualizado);
    } catch (error) {
      responderError(error, res, 'Error al actualizar el usuario');
    }
  }

  async eliminarUsuario(req: Request, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.usuarioService.eliminarUsuario(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar el usuario');
    }
  }
  // (aca termina la clase UsuarioController)
}

function obtenerId(idParam: string | string[] | undefined): number | null {
  const str = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!str || !/^\d+$/.test(str)) return null;
  const id = Number(str);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}


