import { type Request, type Response } from 'express';
import { handleControllerError } from '../shared/error-handler';
import { ClassService, ClaseService } from '../services/class.service';
import { validatePayload } from '../shared/validate';
import { createClassSchema, updateClassSchema } from '../schemas/class.schema';

type IdParams = {
  id: string;
};

function getId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class ClassController {
  private classService: ClassService;

  constructor(classService: ClassService) {
    this.classService = classService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const clases = await this.classService.getAll();
      res.json(clases);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener las clases');
    }
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const clase = await this.classService.getById(id);
      if (!clase) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.json(clase);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener la clase');
    }
  }

  async createClass(req: Request, res: Response): Promise<void> {
    try {
      const data = validatePayload(createClassSchema, req.body);
      const nuevaClase = await this.classService.createClass(data);
      res.status(201).json(nuevaClase);
    } catch (error) {
      handleControllerError(error, res, 'Error al crear la clase');
    }
  }

  async updateClass(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validatePayload(updateClassSchema, req.body);
      const claseActualizada = await this.classService.updateClass(id, data);
      if (!claseActualizada) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.json(claseActualizada);
    } catch (error) {
      handleControllerError(error, res, 'Error al actualizar la clase');
    }
  }

  async deleteClass(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.classService.deleteClass(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res, 'Error al eliminar la clase');
    }
  }
}

export const ClaseController = ClassController;
