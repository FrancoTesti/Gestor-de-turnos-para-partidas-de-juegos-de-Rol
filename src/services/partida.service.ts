// maneja la conversión entre el DTO (lo que ve el frontend) y la entidad (lo que guarda la BD).
import { EntityManager } from '@mikro-orm/core';
import { Partida } from '../entities/Partida.entity';
import { Anfitrion } from '../entities/Anfitrion.entity';
import type { ActualizarPartidaDTO, CrearPartidaDTO, EstadoPartida, PartidaPublicaDTO } from '../types/partida.dto';

// error personalizado: el Anfitrion que se quiere asignar no existe
export class AnfitrionNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún anfitrión con id ${id}`);
    this.name = 'AnfitrionNoEncontradoError';
  }
}

export class PartidaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae TODAS las partidas con los datos del anfitrion
  async obtenerTodas(): Promise<PartidaPublicaDTO[]> {
    // populate anida la carga: primero carga Anfitrion, luego el Usuario del Anfitrion
    const partidas = await this.em.find(Partida, {}, { populate: ['anfitrion', 'anfitrion.usuario'] });
    return partidas.map((p) => this.aPartidaPublica(p));
  }

  // trae solo las partidas ACTIVAS (para el listado requerido por el plan)
  async obtenerActivas(): Promise<PartidaPublicaDTO[]> {
    // estado: true en la BD significa 'activa' en el DTO
    const partidas = await this.em.find(
      Partida,
      { estado: true },
      { populate: ['anfitrion', 'anfitrion.usuario'] },
    );
    return partidas.map((p) => this.aPartidaPublica(p));
  }

  // busca una partida por su id
  async obtenerPorId(id: number): Promise<PartidaPublicaDTO | null> {
    const partida = await this.em.findOne(
      Partida,
      { idPartida: id },
      { populate: ['anfitrion', 'anfitrion.usuario'] },
    );
    return partida ? this.aPartidaPublica(partida) : null;
  }

  // crea una partida nueva aplicando todas las reglas de negocio
  async crearPartida(data: CrearPartidaDTO): Promise<PartidaPublicaDTO> {
    // regla 1: el Anfitrion debe existir antes de crear la partida
    const anfitrion = await this.em.findOne(
      Anfitrion,
      data.idUsuarioAnfitrion as any,
      { populate: ['usuario'] },
    );
    if (!anfitrion) {
      throw new AnfitrionNoEncontradoError(data.idUsuarioAnfitrion);
    }

    /* Conversión DTO -> entidad:
     - 'activa' -> true  |  'finalizada' -> false
     - esPrivada con contrasena -> contrasena como string  |  publica -> string vacio ""*/
    const partida = this.em.create(Partida, {
      nombre: data.nombre,
      estado: data.estado === 'activa',             // conversión string -> boolean
      limiteJugadores: data.limiteJugadores,
      contrasena: data.esPrivada ? (data.contrasena ?? '') : '', // '' = pública
      anfitrion,
    } as any); // 'as any' porque TypeScript no infiere que idPartida es autoincrement

    await this.em.flush();
    return this.aPartidaPublica(partida);
  }

  // actualiza los campos que lleguen en el body
  async actualizarPartida(id: number, data: ActualizarPartidaDTO): Promise<PartidaPublicaDTO | null> {
    const partida = await this.em.findOne(
      Partida,
      { idPartida: id },
      { populate: ['anfitrion', 'anfitrion.usuario'] },
    );
    if (!partida) return null;

    // actualizamos solo los campos que llegaron
    if (data.nombre !== undefined) partida.nombre = data.nombre;
    if (data.limiteJugadores !== undefined) partida.limiteJugadores = data.limiteJugadores;
    if (data.estado !== undefined) partida.estado = data.estado === 'activa';
    if (data.esPrivada !== undefined) {
      // si cambian a publica, borramos la contraseña
      if (!data.esPrivada) partida.contrasena = '';
    }
    if (data.contrasena !== undefined) partida.contrasena = data.contrasena;

    await this.em.flush();
    return this.aPartidaPublica(partida);
  }

  // elimina una partida
  async eliminarPartida(id: number): Promise<boolean> {
    const partida = await this.em.findOne(Partida, { idPartida: id });
    if (!partida) return false;

    await this.em.removeAndFlush(partida);
    return true;
  }

  // convierte la entidad al DTO publico (sin exponer la contraseña)
  private aPartidaPublica(p: Partida): PartidaPublicaDTO {
    return {
      idPartida: p.idPartida,
      nombre: p.nombre,
      // conversion inversa: boolean -> string legible
      estado: p.estado ? 'activa' : 'finalizada',
      limiteJugadores: p.limiteJugadores,
      // una partida es privada si tiene contraseña no vaciaa
      esPrivada: p.contrasena !== '',
      // NUNCA devuelvo la contraseña (igual que con la contraseña del usuario)
      idUsuarioAnfitrion: p.anfitrion.usuario.idUsuario,
      nicknameAnfitrion: p.anfitrion.usuario.nickname,
    };
  }
}