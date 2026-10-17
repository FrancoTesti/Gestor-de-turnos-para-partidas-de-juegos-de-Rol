import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserController, UsuarioController } from '../controllers/user.controller';
import { UserService, UsuarioService, NicknameEnUsoError } from '../services/user.service';
import type { Request, Response } from 'express';

describe('UserController', () => {
  let mockService: Partial<UserService>;
  let controller: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
    };
    controller = new UserController(mockService as UserService);

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

  describe('createUser', () => {
    it('debe responder 201 con el usuario creado', async () => {
      const nuevo = { idUsuario: 1, nombreUsuario: 'Ana', imagen: '', nickname: 'ana1' };
      req.body = { nombreUsuario: 'Ana', contrasena: '123456', nickname: 'ana1' };
      vi.mocked(mockService.createUser!).mockResolvedValue(nuevo);

      await controller.createUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(nuevo);
    });

    it('debe responder 409 cuando el nickname ya está en uso', async () => {
      req.body = { nombreUsuario: 'Ana', contrasena: '123456', nickname: 'existente' };
      vi.mocked(mockService.createUser!).mockRejectedValue(new NicknameEnUsoError());

      await controller.createUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'El nickname ya está en uso' });
    });
  });

  describe('updateUser', () => {
    it('debe responder 400 si el ID es inválido', async () => {
      req.params = { id: 'abc' };

      await controller.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'ID inválido' });
    });

    it('debe responder 404 si el usuario no existe', async () => {
      req.params = { id: '99' };
      req.body = { nombreUsuario: 'Nuevo' };
      vi.mocked(mockService.updateUser!).mockResolvedValue(null);

      await controller.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado para actualizar' });
    });

    it('debe responder 200 con el usuario actualizado', async () => {
      req.params = { id: '1' };
      req.body = { nombreUsuario: 'Nuevo' };
      const actualizado = { idUsuario: 1, nombreUsuario: 'Nuevo', imagen: '', nickname: 'j1' };
      vi.mocked(mockService.updateUser!).mockResolvedValue(actualizado);

      await controller.updateUser(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(actualizado);
    });
  });

  describe('deleteUser', () => {
    it('debe responder 204 al eliminar un usuario exitosamente', async () => {
      req.params = { id: '1' };
      vi.mocked(mockService.deleteUser!).mockResolvedValue(true);

      await controller.deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('debe responder 404 si el usuario a eliminar no existe', async () => {
      req.params = { id: '99' };
      vi.mocked(mockService.deleteUser!).mockResolvedValue(false);

      await controller.deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario no encontrado' });
    });
  });
});
