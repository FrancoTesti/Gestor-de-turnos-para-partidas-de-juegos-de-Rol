/* Recibe las peticiones HTTP, llama al service
y responde con el código y datos correctos. No tiene logica de negocio */
import { type Request, type Response } from 'express';
import {
  AnfitrionService,
  AnfitrionYaExisteError,
  UsuarioNoEncontradoError,
} from '../services/anfitrion.service';
import {
  ErrorValidacionAnfitrion,
  validarActualizacionAnfitrion,
  validarCreacionAnfitrion,
} from '../validators/anfitrion.validator';

type IdParams = { id: string };

function responderError(error: unknown, res: Response, mensajeInterno: string): void {
  if (error instanceof ErrorValidacionAnfitrion) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof UsuarioNoEncontradoError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof AnfitrionYaExisteError) {
    res.status(409).json({ message: error.message }); // ya es anfitrion
    return;
  }
  console.error(mensajeInterno, error);
  res.status(500).json({ message: mensajeInterno });
}

function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class AnfitrionController {
  private anfitrionService: AnfitrionService;

  constructor(anfitrionService: AnfitrionService) {
    this.anfitrionService = anfitrionService;
  }

  // GET /api/anfitriones
  async obtenerTodos(_req: Request, res: Response): Promise<void> {
    try {
      const anfitriones = await this.anfitrionService.obtenerTodos();
      res.json(anfitriones);
    } catch (error) {
      responderError(error, res, 'Error al obtener anfitriones');
    }
  }

  // GET /api/anfitriones/:id
  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const anfitrion = await this.anfitrionService.obtenerPorId(id);
      if (!anfitrion) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.json(anfitrion);
    } catch (error) {
      responderError(error, res, 'Error al obtener el anfitrión');
    }
  }

  // POST /api/anfitriones
  async crearAnfitrion(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionAnfitrion(req.body);
      const nuevoAnfitrion = await this.anfitrionService.crearAnfitrion(data);
      res.status(201).json(nuevoAnfitrion);
    } catch (error) {
      responderError(error, res, 'Error al crear el anfitrión');
    }
  }

  // PUT /api/anfitriones/:id
  async actualizarAnfitrion(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionAnfitrion(req.body);
      const actualizado = await this.anfitrionService.actualizarAnfitrion(id, data);
      if (!actualizado) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.json(actualizado);
    } catch (error) {
      responderError(error, res, 'Error al actualizar el anfitrión');
    }
  }

  // DELETE /api/anfitriones/:id
  async eliminarAnfitrion(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.anfitrionService.eliminarAnfitrion(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Anfitrión no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar el anfitrión');
    }
  }
}