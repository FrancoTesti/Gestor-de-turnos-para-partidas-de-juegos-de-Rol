// para las operaciones de Partida antes de pasarlos al service.
import type { ActualizarPartidaDTO, CrearPartidaDTO, EstadoPartida } from '../types/partida.dto';

// los unicos estados valids (funciona como un enum)
    const ESTADOS_VALIDOS: EstadoPartida[] = ['activa', 'finalizada'];

// error personalizado para distinguirlo de otros en el controller
export class ErrorValidacionPartida extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionPartida';
  }
}

// valida los datos para CREAR una Partida
export function validarCreacionPartida(body: unknown): CrearPartidaDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionPartida('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;

  // nombre: texto obligatorio, máximo 100 caracteres
  if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
    throw new ErrorValidacionPartida('El campo nombre es obligatorio');
  }
  if (payload.nombre.trim().length > 100) {
    throw new ErrorValidacionPartida('El nombre no puede superar los 100 caracteres');
  }

  // estado: debe ser 'activa' o 'finalizada'
  if (!ESTADOS_VALIDOS.includes(payload.estado as EstadoPartida)) {
    throw new ErrorValidacionPartida(`El campo estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  // limiteJugadores: numero entero y positivo obligatorio
  if (
    typeof payload.limiteJugadores !== 'number' ||
    !Number.isInteger(payload.limiteJugadores) ||
    payload.limiteJugadores <= 0
  ) {
    throw new ErrorValidacionPartida('El campo limiteJugadores debe ser un número entero positivo');
  }

  // esPrivada: booleano obligatorio
  if (typeof payload.esPrivada !== 'boolean') {
    throw new ErrorValidacionPartida('El campo esPrivada debe ser true o false');
  }

  // regla clave: solo las partidas privadas requieren contraseña
  if (payload.esPrivada) {
    if (typeof payload.contrasena !== 'string' || payload.contrasena.trim() === '') {
      throw new ErrorValidacionPartida('Las partidas privadas deben tener una contraseña');
    }
    if (payload.contrasena.trim().length > 100) {
      throw new ErrorValidacionPartida('La contraseña no puede superar los 100 caracteres');
    }
  }

  // idUsuarioAnfitrion: nro entero positivo
  if (
    typeof payload.idUsuarioAnfitrion !== 'number' ||
    !Number.isInteger(payload.idUsuarioAnfitrion) ||
    payload.idUsuarioAnfitrion <= 0
  ) {
    throw new ErrorValidacionPartida('El campo idUsuarioAnfitrion debe ser un número entero positivo');
  }

  return {
    nombre: payload.nombre.trim(),
    estado: payload.estado as EstadoPartida,
    limiteJugadores: payload.limiteJugadores,
    esPrivada: payload.esPrivada,
    contrasena: payload.esPrivada ? (payload.contrasena as string).trim() : undefined,
    idUsuarioAnfitrion: payload.idUsuarioAnfitrion,
  };
}

// valida los datos para ACTUALIZAR una Partida (todos los campos opcionales)
export function validarActualizacionPartida(body: unknown): ActualizarPartidaDTO {
  if (typeof body !== 'object' || body === null) {
    throw new ErrorValidacionPartida('El cuerpo de la solicitud debe ser un objeto');
  }

  const payload = body as Record<string, unknown>;
  const resultado: ActualizarPartidaDTO = {};

  if (payload.nombre !== undefined) {
    if (typeof payload.nombre !== 'string' || payload.nombre.trim() === '') {
      throw new ErrorValidacionPartida('El campo nombre no puede estar vacío');
    }
    resultado.nombre = payload.nombre.trim();
  }

  if (payload.estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(payload.estado as EstadoPartida)) {
      throw new ErrorValidacionPartida(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }
    resultado.estado = payload.estado as EstadoPartida;
  }

  if (payload.limiteJugadores !== undefined) {
    if (
      typeof payload.limiteJugadores !== 'number' ||
      !Number.isInteger(payload.limiteJugadores) ||
      payload.limiteJugadores <= 0
    ) {
      throw new ErrorValidacionPartida('El campo limiteJugadores debe ser un número entero positivo');
    }
    resultado.limiteJugadores = payload.limiteJugadores;
  }

  if (payload.esPrivada !== undefined) {
    if (typeof payload.esPrivada !== 'boolean') {
      throw new ErrorValidacionPartida('El campo esPrivada debe ser true o false');
    }
    resultado.esPrivada = payload.esPrivada;
  }

  if (payload.contrasena !== undefined) {
    if (typeof payload.contrasena !== 'string' || payload.contrasena.trim() === '') {
      throw new ErrorValidacionPartida('El campo contrasena no puede estar vacío');
    }
    resultado.contrasena = payload.contrasena.trim();
  }

  if (Object.keys(resultado).length === 0) {
    throw new ErrorValidacionPartida('Debe enviar al menos un campo para actualizar');
  }

  return resultado;
}