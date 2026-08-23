import { type Request, type Response } from 'express';
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

  async obtenerTodos(_req: Request, res: Response): Promise<void> {
    try {
      const clases = await this.claseService.obtenerTodos();
      res.json(clases);
    } catch (error) {
      console.error('Error al obtener clases:', error);
      res.status(500).json({ message: 'Error al obtener las clases' });
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const clase = await this.claseService.obtenerPorId(id);
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

  async crearClase(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionClase(req.body);
      const nuevaClase = await this.claseService.crearClase(data);
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

  async actualizarClase(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionClase(req.body);
      const claseActualizada = await this.claseService.actualizarClase(id, data);
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

  async eliminarClase(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.claseService.eliminarClase(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar la clase:', error);
      res.status(500).json({ message: 'Error al eliminar la clase' });
    }
  }
}
