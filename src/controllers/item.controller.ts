import { type Request, type Response } from 'express';
import {
  InsufficientMoneyError,
  DineroInsuficienteError,
  InventoryFullError,
  InventarioLlenoError,
  InventoryNotFoundError,
  InventarioNoEncontradoError,
  ItemNotAvailableError,
  ObjetoNoDisponibleError,
  ItemNotFoundError,
  ObjetoNoEncontradoError,
  ItemService,
  ObjetoService,
  CharacterNotFoundError,
  PersonajeNoEncontradoError,
  PositionOccupiedError,
  PosicionOcupadaError,
  InsufficientLevelError,
  NivelInsuficienteError,
} from '../services/item.service';
import {
  ItemValidationError,
  ErrorValidacionObjeto,
  validateUpdateItem,
  validarActualizacionObjeto,
  validateBuyItem,
  validarCompraObjeto,
  validateCreateItem,
  validarCreacionObjeto,
} from '../validators/item.validator';

type IdParams = {
  id: string;
};

function getId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class ItemController {
  private itemService: ItemService;

  constructor(itemService: ItemService) {
    this.itemService = itemService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const objetos = await this.itemService.getAll();
      res.json(objetos);
    } catch (error) {
      console.error('Error al obtener objetos:', error);
      res.status(500).json({ message: 'Error al obtener los objetos' });
    }
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const objeto = await this.itemService.getById(id);
      if (!objeto) {
        res.status(404).json({ message: 'Objeto no encontrado' });
        return;
      }
      res.json(objeto);
    } catch (error) {
      console.error('Error al obtener el objeto:', error);
      res.status(500).json({ message: 'Error al obtener el objeto' });
    }
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const data = validateCreateItem(req.body);
      const nuevoObjeto = await this.itemService.createItem(data);
      res.status(201).json(nuevoObjeto);
    } catch (error) {
      if (error instanceof ItemValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al crear el objeto:', error);
      res.status(500).json({ message: 'Error al crear el objeto' });
    }
  }

  async updateItem(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validateUpdateItem(req.body);
      const objetoActualizado = await this.itemService.updateItem(id, data);
      if (!objetoActualizado) {
        res.status(404).json({ message: 'Objeto no encontrado' });
        return;
      }
      res.json(objetoActualizado);
    } catch (error) {
      if (error instanceof ItemValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar el objeto:', error);
      res.status(500).json({ message: 'Error al actualizar el objeto' });
    }
  }

  async deleteItem(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.itemService.deleteItem(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Objeto no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar el objeto:', error);
      res.status(500).json({ message: 'Error al eliminar el objeto' });
    }
  }

  async buyItem(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validateBuyItem(req.body);
      const resultado = await this.itemService.buyItem(id, data);
      res.json(resultado);
    } catch (error) {
      if (error instanceof ItemValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (
        error instanceof ItemNotFoundError ||
        error instanceof CharacterNotFoundError ||
        error instanceof InventoryNotFoundError
      ) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (
        error instanceof ItemNotAvailableError ||
        error instanceof InsufficientMoneyError ||
        error instanceof InventoryFullError ||
        error instanceof PositionOccupiedError ||
        error instanceof InsufficientLevelError
      ) {
        res.status(409).json({ message: error.message });
        return;
      }
      console.error('Error al comprar el objeto:', error);
      res.status(500).json({ message: 'Error al comprar el objeto' });
    }
  }

  async getSuggestedItems(req: Request<{ idClase: string }>, res: Response): Promise<void> {
    const idClase = getId(req.params.idClase);
    if (idClase === null) {
      res.status(400).json({ message: 'ID de clase inválido' });
      return;
    }

    try {
      const sugeridos = await this.itemService.getSuggestedItems(idClase);
      res.json(sugeridos);
    } catch (error) {
      console.error('Error al obtener sugeridos:', error);
      res.status(500).json({ message: 'Error al obtener los objetos sugeridos' });
    }
  }
}

export const ObjetoController = ItemController;
