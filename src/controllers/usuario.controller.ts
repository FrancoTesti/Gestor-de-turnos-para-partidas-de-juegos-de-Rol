import {type Request, type Response } from 'express';
import { UsuarioService } from '../services/usuario.service';

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor(usuarioService: UsuarioService) {
    this.usuarioService = usuarioService;
  }

  async obtenerTodos(req: Request, res: Response) {
    try {
      const usuarios = await this.usuarioService.obtenerTodos();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  }

  async obtenerPorId(req: Request, res: Response) {
    try {
      const id = parseInt('${req.params.id}');
      const usuario = await this.usuarioService.obtenerPorId(id);
      
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario' });
    }
  }

  async crearUsuario(req: Request, res: Response) {
    try {
      const nuevoUsuario = await this.usuarioService.crearUsuario(req.body);
      res.status(201).json(nuevoUsuario);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el usuario' });
    }
  }

  async actualizarUsuario(req: Request, res: Response) {
    try {
      const id = parseInt('${req.params.id}');
      const usuarioActualizado = await this.usuarioService.actualizarUsuario(id, req.body);
      
      if (!usuarioActualizado) {
        return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
      }
      
      res.json(usuarioActualizado);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el usuario' });
    }
  }

  async eliminarUsuario(req: Request, res: Response) {
    try {
      const id = parseInt('${req.params.id}');
      const eliminado = await this.usuarioService.eliminarUsuario(id);
      
      if (!eliminado) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
  }
}