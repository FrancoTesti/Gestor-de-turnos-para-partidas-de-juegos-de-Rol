import { type Request, type Response } from 'express';
import { handleControllerError } from '../shared/error-handler';
import {
  ItemService,
  ObjetoService,
} from '../services/item.service';
import { validatePayload } from '../shared/validate';
import { createItemSchema, updateItemSchema, buyItemSchema } from '../schemas/item.schema';

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
      handleControllerError(error, res, 'Error al obtener los objetos');
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
      handleControllerError(error, res, 'Error al obtener el objeto');
    }
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const data = validatePayload(createItemSchema, req.body);
      const nuevoObjeto = await this.itemService.createItem(data);
      res.status(201).json(nuevoObjeto);
    } catch (error) {
      handleControllerError(error, res, 'Error al crear el objeto');
    }
  }

  async updateItem(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validatePayload(updateItemSchema, req.body);
      const objetoActualizado = await this.itemService.updateItem(id, data);
      if (!objetoActualizado) {
        res.status(404).json({ message: 'Objeto no encontrado' });
        return;
      }
      res.json(objetoActualizado);
    } catch (error) {
      handleControllerError(error, res, 'Error al actualizar el objeto');
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
      handleControllerError(error, res, 'Error al eliminar el objeto');
    }
  }

  async buyItem(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validatePayload(buyItemSchema, req.body);
      const resultado = await this.itemService.buyItem(id, data);
      res.json(resultado);
    } catch (error) {
      handleControllerError(error, res, 'Error al comprar el objeto');
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
      handleControllerError(error, res, 'Error al obtener los objetos sugeridos');
    }
  }
}

export const ObjetoController = ItemController;
