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
      obtenerTodos: vi.fn(),
      obtenerPorId: vi.fn(),
      crearJugador: vi.fn(),
      actualizarJugador: vi.fn(),
      eliminarJugador: vi.fn(),
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

  describe('obtenerTodos', () => {
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
      vi.mocked(mockService.obtenerTodos!).mockResolvedValue(mockJugadores);

      await controller.obtenerTodos(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockJugadores);
    });

    it('debe responder 500 y un mensaje cuando el servicio arroja un error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Database connection failed');

      vi.mocked(mockService.obtenerTodos!).mockRejectedValue(error);

      await controller.obtenerTodos(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener jugadores' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener jugadores', error);

      consoleErrorSpy.mockRestore();
    });
  });
});
