/* 
 Controlador para las operaciones relacionadas con los jugadores.
 Recibe las peticiones HTTP, llama al service y responde con el CODIGO
  y datos correctos. No tiene logica de negocio.
 */
import { type Request, type Response } from 'express';
import { persistenceError } from './persistence-error';
import {
  JugadorService,
  JugadorYaExisteError,
  UsuarioNoEncontradoError,
} from '../services/jugador.service';
import {
  ErrorValidacionJugador,
  validarActualizacionJugador,
  validarCreacionJugador,
} from '../validators/jugador.validator';

// tipo para los parametros de URL que tienen un :id (ej: /api/jugadores/5)
type IdParams = { id: string };

/* convierte los errores conocidos a códigos HTTP correctos.
 Si no lo reconoce, devuelve 500 (error interno del servidor). */
function responderError(error: unknown, res: Response, mensajeInterno: string): void {
  if (persistenceError(error, res)) return;
  if (error instanceof ErrorValidacionJugador) {
    res.status(400).json({ message: error.message }); // datos inválidos
    return;
  }
  if (error instanceof UsuarioNoEncontradoError) {
    res.status(404).json({ message: error.message }); // no existe el usuario
    return;
  }
  if (error instanceof JugadorYaExisteError) {
    res.status(409).json({ message: error.message }); // conflicto: ya es jugador
    return;
  }
  console.error(mensajeInterno, error);
  res.status(500).json({ message: mensajeInterno });
}

// parsea y valida el :id de la URL. Devuelve null si no es un número positivo válido.
function obtenerId(idParam: string): number | null {
  if (!/^\d+$/.test(idParam)) return null;
  const id = Number(idParam);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export class JugadorController {
  private jugadorService: JugadorService;

  constructor(jugadorService: JugadorService) {
    this.jugadorService = jugadorService;
  }

  // GET /api/jugadores
  async obtenerTodos(_req: Request, res: Response): Promise<void> {
    try {
      const jugadores = await this.jugadorService.obtenerTodos();
      res.json(jugadores);
    } catch (error) {
      responderError(error, res, 'Error al obtener jugadores');
    }
  }

  // GET /api/jugadores/:id
  async obtenerPorId(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const jugador = await this.jugadorService.obtenerPorId(id);
      if (!jugador) {
        res.status(404).json({ message: 'Jugador no encontrado' });
        return;
      }
      res.json(jugador);
    } catch (error) {
      responderError(error, res, 'Error al obtener el jugador');
    }
  }

  // POST /api/jugadores
  async crearJugador(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionJugador(req.body);
      const nuevoJugador = await this.jugadorService.crearJugador(data);
      res.status(201).json(nuevoJugador); // 201 Created
    } catch (error) {
      responderError(error, res, 'Error al crear el jugador');
    }
  }

  // PUT /api/jugadores/:id
  async actualizarJugador(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const data = validarActualizacionJugador(req.body);
      const actualizado = await this.jugadorService.actualizarJugador(id, data);
      if (!actualizado) {
        res.status(404).json({ message: 'Jugador no encontrado' });
        return;
      }
      res.json(actualizado);
    } catch (error) {
      responderError(error, res, 'Error al actualizar el jugador');
    }
  }

  // DELETE /api/jugadores/:id
  async eliminarJugador(req: Request<IdParams>, res: Response): Promise<void> {
    const id = obtenerId(req.params.id);
    if (id === null) {
      res.status(400).json({ message: 'ID inválido' });
      return;
    }

    try {
      const eliminado = await this.jugadorService.eliminarJugador(id);
      if (!eliminado) {
        res.status(404).json({ message: 'Jugador no encontrado' });
        return;
      }
      res.status(204).send(); // 204 No Content: eliminado exitosamente, sin cuerpo
    } catch (error) {
      responderError(error, res, 'Error al eliminar el jugador');
    }
  }
}
