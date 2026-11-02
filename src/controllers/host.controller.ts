import { type Request, type Response } from 'express';
import { handleControllerError } from '../shared/error-handler';
import {
  HostService,
  AnfitrionService,
} from '../services/host.service';
import {
  validateCreateHost,
} from '../validators/host.validator';

type IdParams = { id: string };

function getId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class HostController {
  private hostService: HostService;

  constructor(hostService: HostService) {
    this.hostService = hostService;
  }

  // GET /api/anfitriones
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const anfitriones = await this.hostService.getAll();
      res.json(anfitriones);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener anfitriones');
    }
  }

  // GET /api/anfitriones/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const anfitrion = await this.hostService.getById(id);
      if (!anfitrion) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.json(anfitrion);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener el anfitrión');
    }
  }

  // POST /api/anfitriones
  async createHost(req: Request, res: Response): Promise<void> {
    try {
      const data = validateCreateHost(req.body);
      const nuevoAnfitrion = await this.hostService.createHost(data);
      res.status(201).json(nuevoAnfitrion);
    } catch (error) {
      handleControllerError(error, res, 'Error al crear el anfitrión');
    }
  }

  // DELETE /api/anfitriones/:id
  async deleteHost(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.hostService.deleteHost(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res, 'Error al eliminar el anfitrión');
    }
  }
}

export const AnfitrionController = HostController;
export const responderError = (error: unknown, res: Response, msg: string) => handleControllerError(error, res, msg);
