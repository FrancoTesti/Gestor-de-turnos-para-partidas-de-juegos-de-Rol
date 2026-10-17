import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import { TiendaService } from '../services/tienda.service';
import {
  ErrorValidacionTienda,
  validarActualizacionTienda,
  validarCreacionTienda,
} from '../validators/tienda.validator';

type IdParams = {
  id: string;
};

function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class TiendaController {
  private tiendaService: TiendaService;

  constructor(tiendaService: TiendaService) {
    this.tiendaService = tiendaService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const getFn = this.tiendaService.getAll ? this.tiendaService.getAll.bind(this.tiendaService) : this.tiendaService.obtenerTodos.bind(this.tiendaService);
      const tiendas = await getFn();
      res.json(tiendas);
    } catch (error) {
      console.error('Error al obtener tiendas:', error);
      res.status(500).json({ message: 'Error al obtener las tiendas' });
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
      const getByIdFn = this.tiendaService.getById ? this.tiendaService.getById.bind(this.tiendaService) : this.tiendaService.obtenerPorId.bind(this.tiendaService);
      const tienda = await getByIdFn(id);
      if (!tienda) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      res.json(tienda);
    } catch (error) {
      console.error('Error al obtener la tienda:', error);
      res.status(500).json({ message: 'Error al obtener la tienda' });
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    return this.getById(req, res);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionTienda(req.body);
      const createFn = this.tiendaService.create ? this.tiendaService.create.bind(this.tiendaService) : this.tiendaService.crearTienda.bind(this.tiendaService);
      const nuevaTienda = await createFn(data);
      res.status(201).json(nuevaTienda);
    } catch (error) {
      if (error instanceof ErrorValidacionTienda) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al crear la tienda:', error);
      res.status(500).json({ message: 'Error al crear la tienda' });
    }
  }

  async crearTienda(req: Request, res: Response): Promise<void> {
    return this.create(req, res);
  }

  async update(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionTienda(req.body);
      const updateFn = this.tiendaService.update ? this.tiendaService.update.bind(this.tiendaService) : this.tiendaService.actualizarTienda.bind(this.tiendaService);
      const tiendaActualizada = await updateFn(id, data);
      if (!tiendaActualizada) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      res.json(tiendaActualizada);
    } catch (error) {
      if (error instanceof ErrorValidacionTienda) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar la tienda:', error);
      res.status(500).json({ message: 'Error al actualizar la tienda' });
    }
  }

  async actualizarTienda(req: Request<IdParams>, res: Response): Promise<void> {
    return this.update(req, res);
  }

  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const deleteFn = this.tiendaService.delete ? this.tiendaService.delete.bind(this.tiendaService) : this.tiendaService.eliminarTienda.bind(this.tiendaService);
      const eliminado = await deleteFn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (persistenceError(error, res)) return;
      console.error('Error al eliminar la tienda:', error);
      res.status(500).json({ message: 'Error al eliminar la tienda' });
    }
  }

  async eliminarTienda(req: Request<IdParams>, res: Response): Promise<void> {
    return this.delete(req, res);
  }
}
