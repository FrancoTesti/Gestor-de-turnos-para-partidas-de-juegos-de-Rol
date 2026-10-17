import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import { ClassService, ClaseService } from '../services/class.service';
import {
  ClassValidationError,
  ErrorValidacionClase,
  validateUpdateClass,
  validarActualizacionClase,
  validateCreateClass,
  validarCreacionClase,
} from '../validators/class.validator';

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
      console.error('Error al obtener clases:', error);
      res.status(500).json({ message: 'Error al obtener las clases' });
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
      console.error('Error al obtener la clase:', error);
      res.status(500).json({ message: 'Error al obtener la clase' });
    }
  }

  async createClass(req: Request, res: Response): Promise<void> {
    try {
      const data = validateCreateClass(req.body);
      const nuevaClase = await this.classService.createClass(data);
      res.status(201).json(nuevaClase);
    } catch (error) {
      if (error instanceof ClassValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al crear la clase:', error);
      res.status(500).json({ message: 'Error al crear la clase' });
    }
  }

  async updateClass(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validateUpdateClass(req.body);
      const claseActualizada = await this.classService.updateClass(id, data);
      if (!claseActualizada) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.json(claseActualizada);
    } catch (error) {
      if (error instanceof ClassValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar la clase:', error);
      res.status(500).json({ message: 'Error al actualizar la clase' });
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
      if (persistenceError(error, res)) return;
      console.error('Error al eliminar la clase:', error);
      res.status(500).json({ message: 'Error al eliminar la clase' });
    }
  }
}

export const ClaseController = ClassController;
