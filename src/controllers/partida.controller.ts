// partida.controller.ts — Recibe las peticiones HTTP, llama al service
// y responde con el código y datos correctos. No tiene lógica de negocio.
import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import {
  AnfitrionNoEncontradoError,
  PartidaService,
} from '../services/partida.service';
import {
  ErrorValidacionPartida,
  validarActualizacionPartida,
  validarCreacionPartida,
} from '../validators/partida.validator';

type IdParams = { id: string };

function responderError(error: unknown, res: Response, mensajeInterno: string): void {
  if (persistenceError(error, res)) return;
  if (error instanceof ErrorValidacionPartida) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof AnfitrionNoEncontradoError) {
    // El anfitrion que querían asignar no existe → 404
    res.status(404).json({ message: error.message });
    return;
  }
  console.error(mensajeInterno, error);
  res.status(500).json({ message: mensajeInterno });
}

function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class PartidaController {
  private partidaService: PartidaService;

  constructor(partidaService: PartidaService) {
    this.partidaService = partidaService;
  }

  // GET /api/partidas
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const partidas = await this.partidaService.getAll();
      res.json(partidas);
    } catch (error) {
      responderError(error, res, 'Error al obtener partidas');
    }
  }

  // GET /api/partidas/activas  ← listado requerido por el plan de desarrollo
  async getActive(_req: Request, res: Response): Promise<void> {
    try {
      const partidasActivas = await this.partidaService.getActive();
      res.json(partidasActivas);
    } catch (error) {
      responderError(error, res, 'Error al obtener las partidas activas');
    }
  }

  // GET /api/partidas/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const partida = await this.partidaService.getById(id);
      if (!partida) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(partida);
    } catch (error) {
      responderError(error, res, 'Error al obtener la partida');
    }
  }

  // POST /api/partidas
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionPartida(req.body);
      const nuevaPartida = await this.partidaService.create(data);
      res.status(201).json(nuevaPartida);
    } catch (error) {
      responderError(error, res, 'Error al crear la partida');
    }
  }

  // PUT /api/partidas/:id
  async update(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionPartida(req.body);
      const actualizada = await this.partidaService.update(id, data);
      if (!actualizada) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(actualizada);
    } catch (error) {
      responderError(error, res, 'Error al actualizar la partida');
    }
  }

  // DELETE /api/partidas/:id
  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminada = await this.partidaService.delete(id);
      if (!eliminada) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar la partida');
    }
  }
}
