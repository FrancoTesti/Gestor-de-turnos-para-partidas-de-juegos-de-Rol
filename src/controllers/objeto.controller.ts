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

  async obtenerTodos(_req: Request, res: Response): Promise<void> {
    try {
      const objetos = await this.objetoService.obtenerTodos();
      res.json(objetos);
    } catch (error) {
      console.error('Error al obtener objetos:', error);
      res.status(500).json({ message: 'Error al obtener los objetos' });
    }
  }

  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const objeto = await this.objetoService.obtenerPorId(id);
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

  async crearObjeto(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionObjeto(req.body);
      const nuevoObjeto = await this.objetoService.crearObjeto(data);
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

  async actualizarObjeto(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionObjeto(req.body);
      const objetoActualizado = await this.objetoService.actualizarObjeto(id, data);
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

  async eliminarObjeto(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.objetoService.eliminarObjeto(id);
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

  async comprarObjeto(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarCompraObjeto(req.body);
      const resultado = await this.objetoService.comprarObjeto(id, data);
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
}
