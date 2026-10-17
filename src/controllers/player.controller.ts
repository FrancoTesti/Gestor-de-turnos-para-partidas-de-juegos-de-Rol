import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import {
  PlayerService,
  JugadorService,
  PlayerAlreadyExistsError,
  JugadorYaExisteError,
  UserNotFoundError,
  UsuarioNoEncontradoError,
} from '../services/player.service';
import {
  PlayerValidationError,
  ErrorValidacionJugador,
  validateUpdatePlayer,
  validarActualizacionJugador,
  validateCreatePlayer,
  validarCreacionJugador,
} from '../validators/player.validator';

type IdParams = { id: string };

function respondError(error: unknown, res: Response, mensajeInterno: string): void {
  if (persistenceError(error, res)) return;
  if (error instanceof PlayerValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof UserNotFoundError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof PlayerAlreadyExistsError) {
    res.status(409).json({ message: error.message });
    return;
  }
  console.error(mensajeInterno, error);
  res.status(500).json({ message: mensajeInterno });
}

export const responderError = respondError;

function getId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class PlayerController {
  private playerService: PlayerService;

  constructor(playerService: PlayerService) {
    this.playerService = playerService;
  }

  // GET /api/jugadores
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const jugadores = await this.playerService.getAll();
      res.json(jugadores);
    } catch (error) {
      respondError(error, res, 'Error al obtener jugadores');
    }
  }

  // GET /api/jugadores/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const jugador = await this.playerService.getById(id);
      if (!jugador) {
        res.status(404).json({ message: 'Jugador no encontrado' });
        return;
      }
      res.json(jugador);
    } catch (error) {
      respondError(error, res, 'Error al obtener el jugador');
    }
  }

  // POST /api/jugadores
  async createPlayer(req: Request, res: Response): Promise<void> {
    try {
      const data = validateCreatePlayer(req.body);
      const nuevoJugador = await this.playerService.createPlayer(data);
      res.status(201).json(nuevoJugador);
    } catch (error) {
      respondError(error, res, 'Error al crear el jugador');
    }
  }

  // PUT /api/jugadores/:id
  async updatePlayer(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validateUpdatePlayer(req.body);
      const actualizado = await this.playerService.updatePlayer(id, data);
      if (!actualizado) {
        res.status(404).json({ message: 'Jugador no encontrado' });
        return;
      }
      res.json(actualizado);
    } catch (error) {
      respondError(error, res, 'Error al actualizar el jugador');
    }
  }

  // DELETE /api/jugadores/:id
  async deletePlayer(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.playerService.deletePlayer(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Jugador no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      respondError(error, res, 'Error al eliminar el jugador');
    }
  }
}

export const JugadorController = PlayerController;
