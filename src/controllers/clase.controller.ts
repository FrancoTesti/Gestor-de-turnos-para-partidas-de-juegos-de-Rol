import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import { ClaseService } from '../services/clase.service';
import {
  ErrorValidacionClase,
  validarActualizacionClase,
  validarCreacionClase,
} from '../validators/clase.validator';

type IdParams = {
  id: string;
};

function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class ClaseController {
  private claseService: ClaseService;

  constructor(claseService: ClaseService) {
    this.claseService = claseService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const getFn = this.claseService.getAll ? this.claseService.getAll.bind(this.claseService) : this.claseService.obtenerTodos.bind(this.claseService);
      const clases = await getFn();
      res.json(clases);
    } catch (error) {
      console.error('Error al obtener clases:', error);
      res.status(500).json({ message: 'Error al obtener las clases' });
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    return this.getAll(req, res);
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const getByIdFn = this.claseService.getById ? this.claseService.getById.bind(this.claseService) : this.claseService.obtenerPorId.bind(this.claseService);
      const clase = await getByIdFn(id);
      if (!clase) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.json(clase);
    } catch (error) {
      console.error('Error al obtener la clase:', error);
      res.status(500).json({ message: 'Error al obtener la clase' });
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    return this.getById(req, res);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionClase(req.body);
      const createFn = this.claseService.create ? this.claseService.create.bind(this.claseService) : this.claseService.crearClase.bind(this.claseService);
      const nuevaClase = await createFn(data);
      res.status(201).json(nuevaClase);
    } catch (error) {
      if (error instanceof ErrorValidacionClase) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al crear la clase:', error);
      res.status(500).json({ message: 'Error al crear la clase' });
    }
  }

  async crearClase(req: Request, res: Response): Promise<void> {
    return this.create(req, res);
  }

  async update(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionClase(req.body);
      const updateFn = this.claseService.update ? this.claseService.update.bind(this.claseService) : this.claseService.actualizarClase.bind(this.claseService);
      const claseActualizada = await updateFn(id, data);
      if (!claseActualizada) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.json(claseActualizada);
    } catch (error) {
      if (error instanceof ErrorValidacionClase) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar la clase:', error);
      res.status(500).json({ message: 'Error al actualizar la clase' });
    }
  }

  async actualizarClase(req: Request<IdParams>, res: Response): Promise<void> {
    return this.update(req, res);
  }

  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const deleteFn = this.claseService.delete ? this.claseService.delete.bind(this.claseService) : this.claseService.eliminarClase.bind(this.claseService);
      const eliminado = await deleteFn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (persistenceError(error, res)) return;
      console.error('Error al eliminar la clase:', error);
      res.status(500).json({ message: 'Error al eliminar la clase' });
    }
  }

  async eliminarClase(req: Request<IdParams>, res: Response): Promise<void> {
    return this.delete(req, res);
  }
}
