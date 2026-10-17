import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsuarioController } from '../controllers/usuario.controller';
import { UsuarioService, NicknameEnUsoError } from '../services/usuario.service';
import type { Request, Response } from 'express';

describe('UsuarioController', () => {
  let mockService: Partial<UsuarioService>;
  let controller: UsuarioController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    controller = new UsuarioController(mockService as UsuarioService);

    req = {
      params: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe('getAll', () => {
    it('debe responder 200 con la lista de usuarios', async () => {
      const mockUsuarios = [{ idUsuario: 1, nombreUsuario: 'Juan', imagen: '', nickname: 'j1' }];
      vi.mocked(mockService.getAll!).mockResolvedValue(mockUsuarios);

      await controller.getAll(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockUsuarios);
    });
  });

  describe('getById', () => {
    it('debe responder 400 cuando el ID es inválido', async () => {
      req.params = { id: 'invalido' };

      await controller.getById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
    });

    it('debe responder 404 cuando el usuario no existe', async () => {
      req.params = { id: '99' };
      vi.mocked(mockService.getById!).mockResolvedValue(null);

      await controller.getById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });

    it('debe responder 200 con el usuario si existe', async () => {
      req.params = { id: '1' };
      const mockUsuario = { idUsuario: 1, nombreUsuario: 'Juan', imagen: '', nickname: 'j1' };
      vi.mocked(mockService.getById!).mockResolvedValue(mockUsuario);

      await controller.getById(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockUsuario);
    });
  });

  describe('create', () => {
    it('debe responder 201 con el usuario creado', async () => {
      const nuevo = { idUsuario: 1, nombreUsuario: 'Ana', imagen: '', nickname: 'ana1' };
      req.body = { nombreUsuario: 'Ana', contrasena: '123456', nickname: 'ana1' };
      vi.mocked(mockService.create!).mockResolvedValue(nuevo);

      await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nuevo);
    });

    it('debe responder 409 cuando el nickname ya está en uso', async () => {
      req.body = { nombreUsuario: 'Ana', contrasena: '123456', nickname: 'existente' };
      vi.mocked(mockService.create!).mockRejectedValue(new NicknameEnUsoError());

      await controller.create(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'El nickname ya está en uso' });
    });
  });

  describe('update', () => {
    it('debe responder 400 si el ID es inválido', async () => {
      req.params = { id: 'abc' };

      await controller.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
    });

    it('debe responder 404 si el usuario no existe', async () => {
      req.params = { id: '99' };
      req.body = { nombreUsuario: 'Nuevo' };
      vi.mocked(mockService.update!).mockResolvedValue(null);

      await controller.update(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado para actualizar' });
    });

    it('debe responder 200 con el usuario actualizado', async () => {
      req.params = { id: '1' };
      req.body = { nombreUsuario: 'Nuevo' };
      const actualizado = { idUsuario: 1, nombreUsuario: 'Nuevo', imagen: '', nickname: 'j1' };
      vi.mocked(mockService.update!).mockResolvedValue(actualizado);

      await controller.update(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(actualizado);
    });
  });

  describe('delete', () => {
    it('debe responder 204 al eliminar un usuario exitosamente', async () => {
      req.params = { id: '1' };
      vi.mocked(mockService.delete!).mockResolvedValue(true);

      await controller.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('debe responder 404 si el usuario a eliminar no existe', async () => {
      req.params = { id: '99' };
      vi.mocked(mockService.delete!).mockResolvedValue(false);

      await controller.delete(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });
  });
});
