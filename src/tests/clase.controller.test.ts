import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaseController } from '../controllers/clase.controller';
import { ClaseService } from '../services/clase.service';
import type { Request, Response } from 'express';

describe('ClaseController', () => {
  let mockService: Partial<ClaseService>;
  let controller: ClaseController;
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
    controller = new ClaseController(mockService as ClaseService);

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
    it('debe responder 200 con la lista de clases', async () => {
      const mockClases = [{ idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Luchador cuerpo a cuerpo' }];
      vi.mocked(mockService.getAll!).mockResolvedValue(mockClases);

      await controller.getAll(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockClases);
    });

    it('debe responder 500 y un mensaje de error si el servicio lanza un error', async () => {
      vi.mocked(mockService.getAll!).mockRejectedValue(new Error('Database error'));

      await controller.getAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener las clases' });
    });
  });

  describe('getById', () => {
    it('debe responder 400 si el id es inválido', async () => {
      req.params = { id: 'abc' };
      await controller.getById(req as any, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe responder 404 si la clase no existe', async () => {
      req.params = { id: '1' };
      vi.mocked(mockService.getById!).mockResolvedValue(null);
      await controller.getById(req as any, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe responder 200 con la clase encontrada', async () => {
      req.params = { id: '1' };
      const clase = { idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Desc' };
      vi.mocked(mockService.getById!).mockResolvedValue(clase);
      await controller.getById(req as any, res as Response);
      expect(res.json).toHaveBeenCalledWith(clase);
    });
  });

  describe('create', () => {
    it('debe responder 201 con la clase creada', async () => {
      req.body = { nombreClase: 'Mago', descripcionClase: 'Magia' };
      const clase = { idClase: 2, nombreClase: 'Mago', descripcionClase: 'Magia' };
      vi.mocked(mockService.create!).mockResolvedValue(clase);
      await controller.create(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(clase);
    });
  });

  describe('update', () => {
    it('debe responder 200 con la clase actualizada', async () => {
      req.params = { id: '1' };
      req.body = { nombreClase: 'Paladín' };
      const clase = { idClase: 1, nombreClase: 'Paladín', descripcionClase: 'Desc' };
      vi.mocked(mockService.update!).mockResolvedValue(clase);
      await controller.update(req as any, res as Response);
      expect(res.json).toHaveBeenCalledWith(clase);
    });
  });

  describe('delete', () => {
    it('debe responder 204 al eliminar', async () => {
      req.params = { id: '1' };
      vi.mocked(mockService.delete!).mockResolvedValue(true);
      await controller.delete(req as any, res as Response);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
