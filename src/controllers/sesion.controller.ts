/* recibe las peticiones HTTP y responde.
No tiene logica de negocio: eso esta en sesion.service.ts */
import { type Request, type Response } from 'express';
import {
  KarmaError,
  PartidaNoEncontradaSesionError,
  SesionDuplicadaError,
  SesionNoEncontradaError,
  SesionService,
} from '../services/sesion.service';
import {
  ErrorValidacionSesion,
  validarActualizacionSesion,
  validarCreacionSesion,
} from '../validators/sesion.validator';

// parametro de ruta que usa este controller
type SesionParams = { idPartida: string; numSesion: string };

// helper: convierte y valida un string de ruta a entero positivo
function obtenerId(valor: string): number | null {
  if (!/^\d+$/.test(valor)) return null;
  const n = Number(valor);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

// helper: centraliza el manejo de errores conocidos
function responderError(error: unknown, res: Response, mensajeGenerico: string): void {
  if (error instanceof ErrorValidacionSesion) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof PartidaNoEncontradaSesionError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof SesionNoEncontradaError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof SesionDuplicadaError) {
    // 409 = conflicto, ya existe ese numSesion en esa partida
    res.status(409).json({ message: error.message });
    return;
  }
  if (error instanceof KarmaError) {
    // las reglas de karma son errores del cliente (400)
    res.status(400).json({ message: error.message });
    return;
  }
  // error inesperado: lo logueamos pero no exponemos detalles al cliente
  console.error(mensajeGenerico, error);
  res.status(500).json({ message: mensajeGenerico });
}

export class SesionController {
  private sesionService: SesionService;

  constructor(sesionService: SesionService) {
    this.sesionService = sesionService;
  }

  // GET /api/sesiones?idPartida=X
  // devuelve todas las sesiones de una partida
  async obtenerPorPartida(req: Request, res: Response): Promise<void> {
    const idPartida = obtenerId(String(req.query.idPartida ?? ''));
    if (idPartida === null) {
      res.status(400).json({ message: 'Debe enviar idPartida como número positivo en la query' });
      return;
    }

    try {
      const sesiones = await this.sesionService.obtenerPorPartida(idPartida);
      res.json(sesiones);
    } catch (error) {
      responderError(error, res, 'Error al obtener sesiones');
    }
  }

  // GET /api/sesiones/:idPartida/:numSesion
  // devuelve una sesión específica
  async obtenerPorId(req: Request<SesionParams>, res: Response): Promise<void> {
    const idPartida = obtenerId(req.params.idPartida);
    const numSesion = obtenerId(req.params.numSesion);

    if (idPartida === null || numSesion === null) {
      res.status(400).json({ message: 'idPartida y numSesion deben ser números positivos' });
      return;
    }

    try {
      const sesion = await this.sesionService.obtenerPorId(idPartida, numSesion);
      if (!sesion) {
        res.status(404).json({ message: 'Sesión no encontrada' });
        return;
      }
      res.json(sesion);
    } catch (error) {
      responderError(error, res, 'Error al obtener la sesión');
    }
  }

  // POST /api/sesiones
  // crea una nueva sesión
  async crearSesion(req: Request, res: Response): Promise<void> {
    try {
      const data = validarCreacionSesion(req.body);
      const nueva = await this.sesionService.crearSesion(data);
      res.status(201).json(nueva);
    } catch (error) {
      responderError(error, res, 'Error al crear la sesión');
    }
  }

  // PUT /api/sesiones/:idPartida/:numSesion
  // actualiza una sesión (por ejemplo, cambiar estado a 'finalizada')
  async actualizarSesion(req: Request<SesionParams>, res: Response): Promise<void> {
    const idPartida = obtenerId(req.params.idPartida);
    const numSesion = obtenerId(req.params.numSesion);

    if (idPartida === null || numSesion === null) {
      res.status(400).json({ message: 'idPartida y numSesion deben ser números positivos' });
      return;
    }

    try {
      const data = validarActualizacionSesion(req.body);
      const actualizada = await this.sesionService.actualizarSesion(idPartida, numSesion, data);
      if (!actualizada) {
        res.status(404).json({ message: 'Sesión no encontrada' });
        return;
      }
      res.json(actualizada);
    } catch (error) {
      responderError(error, res, 'Error al actualizar la sesión');
    }
  }

  // DELETE /api/sesiones/:idPartida/:numSesion
  // elimina una sesión
  async eliminarSesion(req: Request<SesionParams>, res: Response): Promise<void> {
    const idPartida = obtenerId(req.params.idPartida);
    const numSesion = obtenerId(req.params.numSesion);

    if (idPartida === null || numSesion === null) {
      res.status(400).json({ message: 'idPartida y numSesion deben ser números positivos' });
      return;
    }

    try {
      const eliminada = await this.sesionService.eliminarSesion(idPartida, numSesion);
      if (!eliminada) {
        res.status(404).json({ message: 'Sesión no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      responderError(error, res, 'Error al eliminar la sesión');
    }
  }

  // POST /api/sesiones/:idPartida/:numSesion/karma
  // un personaje califica al anfitrión de la sesión
  async darKarma(req: Request<SesionParams>, res: Response): Promise<void> {
    const idPartida = obtenerId(req.params.idPartida);
    const numSesion = obtenerId(req.params.numSesion);

    if (idPartida === null || numSesion === null) {
      res.status(400).json({ message: 'idPartida y numSesion deben ser números positivos' });
      return;
    }

    // el body debe traer { idPersonaje: number }
    const idPersonaje = req.body?.idPersonaje;
    if (typeof idPersonaje !== 'number' || !Number.isInteger(idPersonaje) || idPersonaje <= 0) {
      res.status(400).json({ message: 'idPersonaje debe ser un número entero positivo' });
      return;
    }

    try {
      await this.sesionService.darKarma(idPartida, numSesion, idPersonaje);
      res.json({ message: 'Karma registrado correctamente' });
    } catch (error) {
      responderError(error, res, 'Error al registrar karma');
    }
  }
    // GET /api/sesiones/:idPartida/:numSesion/participantes
  // devuelve los ids de personajes participantes
  async obtenerParticipantes(req: Request<SesionParams>, res: Response): Promise<void> {
    const idPartida = obtenerId(req.params.idPartida);
    const numSesion = obtenerId(req.params.numSesion);

    if (idPartida === null || numSesion === null) {
      res.status(400).json({ message: 'idPartida y numSesion deben ser números positivos' });
      return;
    }

    try {
      const participantes = await this.sesionService.obtenerParticipantes(idPartida, numSesion);
      res.json(participantes);
    } catch (error) {
      responderError(error, res, 'Error al obtener participantes');
    }
  }

  // POST /api/sesiones/:idPartida/:numSesion/participantes
  // agrega un personaje a la sesión
  async agregarParticipante(req: Request<SesionParams>, res: Response): Promise<void> {
    const idPartida = obtenerId(req.params.idPartida);
    const numSesion = obtenerId(req.params.numSesion);

    if (idPartida === null || numSesion === null) {
      res.status(400).json({ message: 'idPartida y numSesion deben ser números positivos' });
      return;
    }

    // el body debe traer { idPersonaje: number }
    const idPersonaje = req.body?.idPersonaje;
    if (typeof idPersonaje !== 'number' || !Number.isInteger(idPersonaje) || idPersonaje <= 0) {
      res.status(400).json({ message: 'idPersonaje debe ser un número entero positivo' });
      return;
    }

    try {
      await this.sesionService.agregarParticipante(idPartida, numSesion, idPersonaje);
      res.status(201).json({ message: 'Participante agregado correctamente' });
    } catch (error) {
      responderError(error, res, 'Error al agregar participante');
    }
  }
}