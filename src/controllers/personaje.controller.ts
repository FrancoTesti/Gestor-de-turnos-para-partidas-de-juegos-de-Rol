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

  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {
      const idClaseQuery = req.query.idClase ? Number(req.query.idClase) : undefined;
      const filtros = idClaseQuery && !isNaN(idClaseQuery) ? { idClase: idClaseQuery } : undefined;

      const personajes = await this.personajeService.obtenerTodos(filtros);
      res.json(personajes);
    } catch (error) {
      console.error('Error al obtener personajes:', error);
      res.status(500).json({ message: 'Error al obtener los personajes' });
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const personaje = await this.personajeService.obtenerPorId(id);
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

  async crearPersonaje(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionPersonaje(req.body);
      const nuevoPersonaje = await this.personajeService.crearPersonaje(data);
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

  async actualizarPersonaje(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const data = validarActualizacionPersonaje(req.body);
      const personajeActualizado = await this.personajeService.actualizarPersonaje(id, data);
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

  async eliminarPersonaje(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const eliminado = await this.personajeService.eliminarPersonaje(id);
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
}
