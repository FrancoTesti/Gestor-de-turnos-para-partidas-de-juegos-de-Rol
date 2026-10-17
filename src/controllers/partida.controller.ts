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
      const getFn = this.partidaService.getAll ? this.partidaService.getAll.bind(this.partidaService) : this.partidaService.obtenerTodas.bind(this.partidaService);
      const partidas = await getFn();
      res.json(partidas);
    } catch (error) {
      responderError(error, res, 'Error al obtener partidas');
    }
  }

  async obtenerTodas(req: Request, res: Response): Promise<void> {
    return this.getAll(req, res);
  }

  // GET /api/partidas/activas  ← listado requerido por el plan de desarrollo
  async getActive(_req: Request, res: Response): Promise<void> {
    try {
      const getActiveFn = this.partidaService.getActive ? this.partidaService.getActive.bind(this.partidaService) : this.partidaService.obtenerActivas.bind(this.partidaService);
      const partidas = await getActiveFn();
      res.json(partidas);
    } catch (error) {
      responderError(error, res, 'Error al obtener partidas activas');
    }
  }

  async obtenerActivas(req: Request, res: Response): Promise<void> {
    return this.getActive(req, res);
  }

  // GET /api/partidas/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const getByIdFn = this.partidaService.getById ? this.partidaService.getById.bind(this.partidaService) : this.partidaService.obtenerPorId.bind(this.partidaService);
      const partida = await getByIdFn(id);
      if (!partida) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(partida);
    } catch (error) {
      responderError(error, res, 'Error al obtener la partida');
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    return this.getById(req, res);
  }

  // POST /api/partidas
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionPartida(req.body);
      const createFn = this.partidaService.create ? this.partidaService.create.bind(this.partidaService) : this.partidaService.crearPartida.bind(this.partidaService);
      const nuevaPartida = await createFn(data);
      res.status(201).json(nuevaPartida);
    } catch (error) {
      responderError(error, res, 'Error al crear la partida');
    }
  }

  async crearPartida(req: Request, res: Response): Promise<void> {
    return this.create(req, res);
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
      const updateFn = this.partidaService.update ? this.partidaService.update.bind(this.partidaService) : this.partidaService.actualizarPartida.bind(this.partidaService);
      const actualizada = await updateFn(id, data);
      if (!actualizada) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.json(actualizada);
    } catch (error) {
      responderError(error, res, 'Error al actualizar la partida');
    }
  }

  async actualizarPartida(req: Request<IdParams>, res: Response): Promise<void> {
    return this.update(req, res);
  }

  // DELETE /api/partidas/:id
  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const deleteFn = this.partidaService.delete ? this.partidaService.delete.bind(this.partidaService) : this.partidaService.eliminarPartida.bind(this.partidaService);
      const eliminado = await deleteFn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Partida no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar la partida');
    }
  }

  async eliminarPartida(req: Request<IdParams>, res: Response): Promise<void> {
    return this.delete(req, res);
  }
}
