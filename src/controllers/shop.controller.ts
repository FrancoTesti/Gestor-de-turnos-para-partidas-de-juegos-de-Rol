import { type Request, type Response } from 'express';
import { handleControllerError } from '../shared/error-handler';
import { ShopService, TiendaService } from '../services/shop.service';
import { validatePayload } from '../shared/validate';
import { createShopSchema, updateShopSchema } from '../schemas/shop.schema';

type IdParams = {
  id: string;
};

function getId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const obtenerId = getId;

export class ShopController {
  private shopService: ShopService;

  constructor(shopService: ShopService) {
    this.shopService = shopService;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const idPartidaQuery = req.query.idPartida ? Number(req.query.idPartida) : undefined;
      const filtros = idPartidaQuery && !isNaN(idPartidaQuery) ? { idPartida: idPartidaQuery } : undefined;
      const tiendas = await this.shopService.getAll(filtros);
      res.json(tiendas);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener las tiendas');
    }
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const tienda = await this.shopService.getById(id);
      if (!tienda) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      res.json(tienda);
    } catch (error) {
      handleControllerError(error, res, 'Error al obtener la tienda');
    }
  }

  async createShop(req: Request, res: Response): Promise<void> {
    try {
      const data = validatePayload(createShopSchema, req.body);
      const nuevaTienda = await this.shopService.createShop(data);
      res.status(201).json(nuevaTienda);
    } catch (error) {
      handleControllerError(error, res, 'Error al crear la tienda');
    }
  }

  async updateShop(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validatePayload(updateShopSchema, req.body);
      const tiendaActualizada = await this.shopService.updateShop(id, data);
      if (!tiendaActualizada) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      res.json(tiendaActualizada);
    } catch (error) {
      handleControllerError(error, res, 'Error al actualizar la tienda');
    }
  }

  async deleteShop(req: Request<IdParams>, res: Response): Promise<void> {
    const id = getId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.shopService.deleteShop(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Tienda no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res, 'Error al eliminar la tienda');
    }
  }
}

export const TiendaController = ShopController;
