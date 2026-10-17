/* Recibe las peticiones HTTP, llama al service
y responde con el código y datos correctos. No tiene logica de negocio */
import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import {
  AnfitrionService,
  AnfitrionYaExisteError,
  UsuarioNoEncontradoError,
} from '../services/anfitrion.service';
import {
  ErrorValidacionAnfitrion,
  validarActualizacionAnfitrion,
  validarCreacionAnfitrion,
} from '../validators/anfitrion.validator';

type IdParams = { id: string };

function responderError(error: unknown, res: Response, mensajeInterno: string): void {
  if (persistenceError(error, res)) return;
  if (error instanceof ErrorValidacionAnfitrion) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof UsuarioNoEncontradoError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof AnfitrionYaExisteError) {
    res.status(409).json({ message: error.message }); // ya es anfitrion
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

export class AnfitrionController {
  private anfitrionService: AnfitrionService;

  constructor(anfitrionService: AnfitrionService) {
    this.anfitrionService = anfitrionService;
  }

  // GET /api/anfitriones
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const getFn = this.anfitrionService.getAll ? this.anfitrionService.getAll.bind(this.anfitrionService) : this.anfitrionService.obtenerTodos.bind(this.anfitrionService);
      const anfitriones = await getFn();
      res.json(anfitriones);
    } catch (error) {
      responderError(error, res, 'Error al obtener anfitriones');
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    return this.getAll(req, res);
  }

  // GET /api/anfitriones/:id
  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const getByIdFn = this.anfitrionService.getById ? this.anfitrionService.getById.bind(this.anfitrionService) : this.anfitrionService.obtenerPorId.bind(this.anfitrionService);
      const anfitrion = await getByIdFn(id);
      if (!anfitrion) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.json(anfitrion);
    } catch (error) {
      responderError(error, res, 'Error al obtener el anfitrión');
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    return this.getById(req, res);
  }

  // POST /api/anfitriones
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionAnfitrion(req.body);
      const createFn = this.anfitrionService.create ? this.anfitrionService.create.bind(this.anfitrionService) : this.anfitrionService.crearAnfitrion.bind(this.anfitrionService);
      const nuevoAnfitrion = await createFn(data);
      res.status(201).json(nuevoAnfitrion);
    } catch (error) {
      responderError(error, res, 'Error al crear el anfitrión');
    }
  }

  async crearAnfitrion(req: Request, res: Response): Promise<void> {
    return this.create(req, res);
  }

  // PUT /api/anfitriones/:id
  async update(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionAnfitrion(req.body);
      const updateFn = this.anfitrionService.update ? this.anfitrionService.update.bind(this.anfitrionService) : this.anfitrionService.actualizarAnfitrion.bind(this.anfitrionService);
      const actualizado = await updateFn(id, data);
      if (!actualizado) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.json(actualizado);
    } catch (error) {
      responderError(error, res, 'Error al actualizar el anfitrión');
    }
  }

  async actualizarAnfitrion(req: Request<IdParams>, res: Response): Promise<void> {
    return this.update(req, res);
  }

  // DELETE /api/anfitriones/:id
  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const deleteFn = this.anfitrionService.delete ? this.anfitrionService.delete.bind(this.anfitrionService) : this.anfitrionService.eliminarAnfitrion.bind(this.anfitrionService);
      const eliminado = await deleteFn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar el anfitrión');
    }
  }

  async eliminarAnfitrion(req: Request<IdParams>, res: Response): Promise<void> {
    return this.delete(req, res);
  }
}
