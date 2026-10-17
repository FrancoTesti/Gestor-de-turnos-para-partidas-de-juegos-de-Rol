import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JugadorController } from '../controllers/jugador.controller';
import { JugadorService } from '../services/jugador.service';
import type { Request, Response } from 'express';

describe('JugadorController', () => {
  let mockService: Partial<JugadorService>;
  let controller: JugadorController;
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
    controller = new JugadorController(mockService as JugadorService);

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
    it('debe responder 200 con la lista de jugadores', async () => {
      const mockJugadores = [
        {
          idJugador: 1,
          idUsuario: 1,
          idClase: 1,
          nivel: 1,
          experiencia: 0,
          oro: 100,
          usuario: { nombreUsuario: 'Juan' },
          clase: { nombre: 'Guerrero' },
          atributos: { fuerza: 10, destreza: 10, inteligencia: 10, constitucion: 10 },
          personajes: [],
        } as any
      ];
      vi.mocked(mockService.getAll!).mockResolvedValue(mockJugadores);

      await controller.getAll(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockJugadores);
    });

    it('debe responder 500 y un mensaje cuando el servicio arroja un error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Database connection failed');

      vi.mocked(mockService.getAll!).mockRejectedValue(error);

      await controller.getAll(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener jugadores' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener jugadores', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('debe responder 400 si el id es inválido', async () => {
      req.params = { id: 'abc' };
      await controller.getById(req as any, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe responder 404 si el jugador no existe', async () => {
      req.params = { id: '1' };
      vi.mocked(mockService.getById!).mockResolvedValue(null);
      await controller.getById(req as any, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe responder 200 con el jugador', async () => {
      req.params = { id: '1' };
      const jugador = { idUsuario: 1, estado: true, nombreUsuario: 'J', nickname: 'j', imagen: '' };
      vi.mocked(mockService.getById!).mockResolvedValue(jugador);
      await controller.getById(req as any, res as Response);
      expect(res.json).toHaveBeenCalledWith(jugador);
    });
  });

  describe('create', () => {
    it('debe responder 201 al crear jugador', async () => {
      req.body = { idUsuario: 1, estado: true };
      const jugador = { idUsuario: 1, estado: true, nombreUsuario: 'J', nickname: 'j', imagen: '' };
      vi.mocked(mockService.create!).mockResolvedValue(jugador);
      await controller.create(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(jugador);
    });
  });

  describe('update', () => {
    it('debe responder 200 al actualizar jugador', async () => {
      req.params = { id: '1' };
      req.body = { estado: false };
      const jugador = { idUsuario: 1, estado: false, nombreUsuario: 'J', nickname: 'j', imagen: '' };
      vi.mocked(mockService.update!).mockResolvedValue(jugador);
      await controller.update(req as any, res as Response);
      expect(res.json).toHaveBeenCalledWith(jugador);
    });
  });

  describe('delete', () => {
    it('debe responder 204 al eliminar jugador', async () => {
      req.params = { id: '1' };
      vi.mocked(mockService.delete!).mockResolvedValue(true);
      await controller.delete(req as any, res as Response);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
