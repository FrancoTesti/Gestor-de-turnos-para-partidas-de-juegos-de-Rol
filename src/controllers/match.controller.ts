import { type Request, type Response } from 'express';
import { handleControllerError } from '../shared/error-handler';
import {
  MatchService,
  PartidaService,
} from '../services/match.service';
import { validatePayload } from '../shared/validate';
import { createMatchSchema, updateMatchSchema } from '../schemas/match.schema';

type IdParams = { id: string };

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
      handleControllerError(error, res, 'Error al obtener partidas');
    }
  }

  // GET /api/partidas/activas
  async getActive(_req: Request, res: Response): Promise<void> {
    try {
      const partidas = await this.matchService.getActive();
      res.json(partidas);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener partidas activas');
    }
  }

  // GET /api/partidas/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
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
      handleControllerError(error, res, 'Error al obtener la partida');
    }
  }

  // POST /api/partidas
  async createMatch(req: Request, res: Response): Promise<void> {
    try {
      const data = validatePayload(createMatchSchema, req.body);
      const nuevaPartida = await this.matchService.createMatch(data);
      res.status(201).json(nuevaPartida);
    } catch (error) {
      handleControllerError(error, res, 'Error al crear la partida');
    }
  }

  // PUT /api/partidas/:id
  async updateMatch(req: Request<IdParams>, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validatePayload(updateMatchSchema, req.body);
      const actualizada = await this.matchService.updateMatch(id, data);
      if (!actualizada) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(actualizada);
    } catch (error) {
      handleControllerError(error, res, 'Error al actualizar la partida');
    }
  }

  // DELETE /api/partidas/:id
  async deleteMatch(req: Request<IdParams>, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
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
      handleControllerError(error, res, 'Error al eliminar la partida');
    }
  }
}

export const PartidaController = MatchController;
export function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
export const responderError = (error: unknown, res: Response, msg: string) => handleControllerError(error, res, msg);
