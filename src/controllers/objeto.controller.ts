import { type Request, type Response } from 'express';
import {
  DineroInsuficienteError,
  InventarioLlenoError,
  InventarioNoEncontradoError,
  ObjetoNoDisponibleError,
  ObjetoNoEncontradoError,
  ObjetoService,
  PersonajeNoEncontradoError,
  PosicionOcupadaError,
} from '../services/objeto.service';
import {
  ErrorValidacionObjeto,
  validarActualizacionObjeto,
  validarCompraObjeto,
  validarCreacionObjeto,
} from '../validators/objeto.validator';

type IdParams = {
  id: string;
};

function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class ObjetoController {
  private objetoService: ObjetoService;

  constructor(objetoService: ObjetoService) {
    this.objetoService = objetoService;
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const objetos = await this.objetoService.getAll();
      res.json(objetos);
    } catch (error) {
      console.error('Error al obtener objetos:', error);
      res.status(500).json({ message: 'Error al obtener los objetos' });
    }
  }

  async getById(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const objeto = await this.objetoService.getById(id);
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionObjeto(req.body);
      const nuevoObjeto = await this.objetoService.create(data);
      res.status(201).json(nuevoObjeto);
    } catch (error) {
      if (error instanceof ErrorValidacionObjeto) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al crear el objeto:', error);
      res.status(500).json({ message: 'Error al crear el objeto' });
    }
  }

  async update(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionObjeto(req.body);
      const objetoActualizado = await this.objetoService.update(id, data);
      if (!objetoActualizado) {
        res.status(404).json({ message: 'Objeto no encontrado' });
        return;
      }
      res.json(objetoActualizado);
    } catch (error) {
      if (error instanceof ErrorValidacionObjeto) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('Error al actualizar el objeto:', error);
      res.status(500).json({ message: 'Error al actualizar el objeto' });
    }
  }

  async delete(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.objetoService.delete(id);
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

  async buy(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarCompraObjeto(req.body);
      const resultado = await this.objetoService.buy(id, data);
      res.json(resultado);
    } catch (error) {
      if (error instanceof ErrorValidacionObjeto) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (
        error instanceof ObjetoNoEncontradoError ||
        error instanceof PersonajeNoEncontradoError ||
        error instanceof InventarioNoEncontradoError
      ) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (
        error instanceof ObjetoNoDisponibleError ||
        error instanceof DineroInsuficienteError ||
        error instanceof InventarioLlenoError ||
        error instanceof PosicionOcupadaError
      ) {
        res.status(409).json({ message: error.message });
        return;
      }
      console.error('Error al comprar el objeto:', error);
      res.status(500).json({ message: 'Error al comprar el objeto' });
    }
  }

  async getSuggested(req: Request<{ idClase: string }>, res: Response): Promise<void> {
    const idClase = obtenerId(req.params.idClase);
    if (idClase === null) {
      res.status(400).json({ message: 'ID de clase inválido' });
      return;
    }

    try {
      const sugeridos = await this.objetoService.getSuggested(idClase);
      res.json(sugeridos);
    } catch (error) {
      console.error('Error al obtener sugeridos:', error);
      res.status(500).json({ message: 'Error al obtener los objetos sugeridos' });
    }
  }
}
