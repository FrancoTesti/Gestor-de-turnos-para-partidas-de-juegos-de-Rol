import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import { PersonajeService, ErrorReferenciaNoEncontrada } from '../services/personaje.service';
import {
  ErrorValidacionPersonaje,
  validarActualizacionPersonaje,
  validarCreacionPersonaje,
} from '../validators/personaje.validator';

type IdParams = {
  id: string;
};

function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class PersonajeController {
  private personajeService: PersonajeService;

  constructor(personajeService: PersonajeService) {
    this.personajeService = personajeService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const idClaseQuery = req.query.idClase ? Number(req.query.idClase) : undefined;
      const filtros = idClaseQuery && !isNaN(idClaseQuery) ? { idClase: idClaseQuery } : undefined;

      const getFn = this.personajeService.getAll ? this.personajeService.getAll.bind(this.personajeService) : this.personajeService.obtenerTodos.bind(this.personajeService);
      const personajes = await getFn(filtros);
      res.json(personajes);
    } catch (error) {
      console.error('Error al obtener personajes:', error);
      res.status(500).json({ message: 'Error al obtener los personajes' });
    }
  }

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    return this.getAll(req, res);
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const getByIdFn = this.personajeService.getById ? this.personajeService.getById.bind(this.personajeService) : this.personajeService.obtenerPorId.bind(this.personajeService);
      const personaje = await getByIdFn(id);
      if (!personaje) {
        res.status(404).json({ message: 'Personaje no encontrado' });
        return;
      }
      res.json(personaje);
    } catch (error) {
      console.error('Error al obtener el personaje:', error);
      res.status(500).json({ message: 'Error al obtener el personaje' });
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    return this.getById(req, res);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionPersonaje(req.body);
      const createFn = this.personajeService.create ? this.personajeService.create.bind(this.personajeService) : this.personajeService.crearPersonaje.bind(this.personajeService);
      const nuevoPersonaje = await createFn(data);
      res.status(201).json(nuevoPersonaje);
    } catch (error) {
      if (error instanceof ErrorValidacionPersonaje) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof ErrorReferenciaNoEncontrada) {
        res.status(404).json({ message: error.message });
        return;
      }
      console.error('Error al crear el personaje:', error);
      res.status(500).json({ message: 'Error interno al crear el personaje' });
    }
  }

  async crearPersonaje(req: Request, res: Response): Promise<void> {
    return this.create(req, res);
  }

  async update(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const data = validarActualizacionPersonaje(req.body);
      const updateFn = this.personajeService.update ? this.personajeService.update.bind(this.personajeService) : this.personajeService.actualizarPersonaje.bind(this.personajeService);
      const personajeActualizado = await updateFn(id, data);
      if (!personajeActualizado) {
        res.status(404).json({ message: 'Personaje no encontrado' });
        return;
      }
      res.json(personajeActualizado);
    } catch (error) {
      if (error instanceof ErrorValidacionPersonaje) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof ErrorReferenciaNoEncontrada) {
        res.status(404).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar el personaje:', error);
      res.status(500).json({ message: 'Error interno al actualizar el personaje' });
    }
  }

  async actualizarPersonaje(req: Request<IdParams>, res: Response): Promise<void> {
    return this.update(req, res);
  }

  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const deleteFn = this.personajeService.delete ? this.personajeService.delete.bind(this.personajeService) : this.personajeService.eliminarPersonaje.bind(this.personajeService);
      const eliminado = await deleteFn(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Personaje no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof ErrorValidacionPersonaje) { res.status(409).json({ message: error.message }); return; }
      if (persistenceError(error, res)) return;
      console.error('Error al eliminar el personaje:', error);
      res.status(500).json({ message: 'Error al eliminar el personaje' });
    }
  }

  async eliminarPersonaje(req: Request<IdParams>, res: Response): Promise<void> {
    return this.delete(req, res);
  }
}
