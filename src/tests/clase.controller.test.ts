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
      obtenerTodos: vi.fn(),
      obtenerPorId: vi.fn(),
      crearClase: vi.fn(),
      actualizarClase: vi.fn(),
      eliminarClase: vi.fn(),
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

  describe('obtenerTodos', () => {
    it('debe responder 200 con la lista de clases', async () => {
      const mockClases = [{ idClase: 1, nombreClase: 'Guerrero', descripcionClase: 'Luchador cuerpo a cuerpo' }];
      vi.mocked(mockService.obtenerTodos!).mockResolvedValue(mockClases);

      await controller.obtenerTodos(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockClases);
    });

    it('debe responder 500 y un mensaje de error si el servicio lanza un error', async () => {
      vi.mocked(mockService.obtenerTodos!).mockRejectedValue(new Error('Database error'));

      await controller.obtenerTodos(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener las clases' });
    });
  });
});
