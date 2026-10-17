import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import {
  CharacterService,
  PersonajeService,
  ReferenceNotFoundError,
  ErrorReferenciaNoEncontrada,
} from '../services/character.service';
import {
  CharacterValidationError,
  ErrorValidacionPersonaje,
  validateUpdateCharacter,
  validarActualizacionPersonaje,
  validateCreateCharacter,
  validarCreacionPersonaje,
} from '../validators/character.validator';

type IdParams = {
  id: string;
};

function getId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class CharacterController {
  private characterService: CharacterService;

  constructor(characterService: CharacterService) {
    this.characterService = characterService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const idClaseQuery = req.query.idClase ? Number(req.query.idClase) : undefined;
      const filtros = idClaseQuery && !isNaN(idClaseQuery) ? { idClase: idClaseQuery } : undefined;

      const personajes = await this.characterService.getAll(filtros);
      res.json(personajes);
    } catch (error) {
      console.error('Error al obtener personajes:', error);
      res.status(500).json({ message: 'Error al obtener los personajes' });
    }
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const personaje = await this.characterService.getById(id);
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

  async createCharacter(req: Request, res: Response): Promise<void> {
    try {
      const data = validateCreateCharacter(req.body);
      const nuevoPersonaje = await this.characterService.createCharacter(data);
      res.status(201).json(nuevoPersonaje);
    } catch (error) {
      if (error instanceof CharacterValidationError || error instanceof ErrorValidacionPersonaje) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof ReferenceNotFoundError || error instanceof ErrorReferenciaNoEncontrada) {
        res.status(404).json({ message: error.message });
        return;
      }
      console.error('Error al crear el personaje:', error);
      res.status(500).json({ message: 'Error interno al crear el personaje' });
    }
  }

  async updateCharacter(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const data = validateUpdateCharacter(req.body);
      const personajeActualizado = await this.characterService.updateCharacter(id, data);
      if (!personajeActualizado) {
        res.status(404).json({ message: 'Personaje no encontrado' });
        return;
      }
      res.json(personajeActualizado);
    } catch (error) {
      if (error instanceof CharacterValidationError || error instanceof ErrorValidacionPersonaje) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof ReferenceNotFoundError || error instanceof ErrorReferenciaNoEncontrada) {
        res.status(404).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar el personaje:', error);
      res.status(500).json({ message: 'Error interno al actualizar el personaje' });
    }
  }

  async deleteCharacter(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID de personaje inválido' });
      return;
    }

    try {
      const eliminado = await this.characterService.deleteCharacter(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Personaje no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof CharacterValidationError || error instanceof ErrorValidacionPersonaje) {
        res.status(409).json({ message: error.message });
        return;
      }
      if (persistenceError(error, res)) return;
      console.error('Error al eliminar el personaje:', error);
      res.status(500).json({ message: 'Error al eliminar el personaje' });
    }
  }

  obtenerTodos = this.getAll.bind(this);
  obtenerPorId = this.getById.bind(this);
  crearPersonaje = this.createCharacter.bind(this);
  actualizarPersonaje = this.updateCharacter.bind(this);
  eliminarPersonaje = this.deleteCharacter.bind(this);
}

export const PersonajeController = CharacterController;
