import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerController } from '../controllers/player.controller';
import { PlayerService } from '../services/player.service';
import type { Request, Response } from 'express';

describe('PlayerController', () => {
  let mockService: Partial<PlayerService>;
  let controller: PlayerController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      createPlayer: vi.fn(),
      updatePlayer: vi.fn(),
      deletePlayer: vi.fn(),
    };
    controller = new PlayerController(mockService as PlayerService);

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
});
