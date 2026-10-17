import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import {
  HostNotFoundError,
  AnfitrionNoEncontradoError,
  MatchService,
  PartidaService,
} from '../services/match.service';
import {
  MatchValidationError,
  ErrorValidacionPartida,
  validateUpdateMatch,
  validarActualizacionPartida,
  validateCreateMatch,
  validarCreacionPartida,
} from '../validators/match.validator';

type IdParams = { id: string };

function respondError(error: unknown, res: Response, mensajeInterno: string): void {
  if (persistenceError(error, res)) return;
  if (error instanceof MatchValidationError || error instanceof ErrorValidacionPartida) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof HostNotFoundError || error instanceof AnfitrionNoEncontradoError) {
    res.status(404).json({ message: error.message });
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

export class MatchController {
  private matchService: MatchService;

  constructor(matchService: MatchService) {
    this.matchService = matchService;
  }

  // GET /api/partidas
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const partidas = await this.matchService.getAll();
      res.json(partidas);
    } catch (error) {
      respondError(error, res, 'Error al obtener partidas');
    }
  }

  // GET /api/partidas/activas
  async getActive(_req: Request, res: Response): Promise<void> {
    try {
      const partidas = await this.matchService.getActive();
      res.json(partidas);
    } catch (error) {
      respondError(error, res, 'Error al obtener partidas activas');
    }
  }

  // GET /api/partidas/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const partida = await this.matchService.getById(id);
      if (!partida) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(partida);
    } catch (error) {
      respondError(error, res, 'Error al obtener la partida');
    }
  }

  // POST /api/partidas
  async createMatch(req: Request, res: Response): Promise<void> {
    try {
      const data = validateCreateMatch(req.body);
      const nuevaPartida = await this.matchService.createMatch(data);
      res.status(201).json(nuevaPartida);
    } catch (error) {
      respondError(error, res, 'Error al crear la partida');
    }
  }

  // PUT /api/partidas/:id
  async updateMatch(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validateUpdateMatch(req.body);
      const actualizada = await this.matchService.updateMatch(id, data);
      if (!actualizada) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(actualizada);
    } catch (error) {
      respondError(error, res, 'Error al actualizar la partida');
    }
  }

  // DELETE /api/partidas/:id
  async deleteMatch(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.matchService.deleteMatch(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      respondError(error, res, 'Error al eliminar la partida');
    }
  }

  obtenerTodas = this.getAll.bind(this);
  obtenerActivas = this.getActive.bind(this);
  obtenerPorId = this.getById.bind(this);
  crearPartida = this.createMatch.bind(this);
  actualizarPartida = this.updateMatch.bind(this);
  eliminarPartida = this.deleteMatch.bind(this);
}

export const PartidaController = MatchController;
