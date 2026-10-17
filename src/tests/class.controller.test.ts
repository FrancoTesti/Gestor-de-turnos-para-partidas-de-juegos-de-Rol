import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassController } from '../controllers/class.controller';
import { ClassService } from '../services/class.service';
import type { Request, Response } from 'express';

describe('ClassController', () => {
  let mockService: Partial<ClassService>;
  let controller: ClassController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      createClass: vi.fn(),
      updateClass: vi.fn(),
      deleteClass: vi.fn(),
    };
    controller = new ClassController(mockService as ClassService);

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
});
