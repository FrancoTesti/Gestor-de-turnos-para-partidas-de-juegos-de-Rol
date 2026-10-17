// no sabe nada de Express (HTTP). Solo aplica reglas y habla con la BD.
import { EntityManager } from '@mikro-orm/core';
import { Jugador } from '../entities/Player.entity';
import { Usuario } from '../entities/User.entity';
import type { ActualizarJugadorDTO, CrearJugadorDTO, JugadorPublicoDTO } from '../types/player.dto';

// error personalizado: el Usuario no existe en la BD
export class UsuarioNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún usuario con id ${id}`);
    this.name = 'UsuarioNoEncontradoError';
  }
}
export const UserNotFoundError = UsuarioNoEncontradoError;
export type UserNotFoundError = UsuarioNoEncontradoError;

// error personalizado: ese Usuario ya es Jugador (no puede registrarse dos veces)
export class JugadorYaExisteError extends Error {
  constructor(id: number) {
    super(`El usuario ${id} ya está registrado como jugador`);
    this.name = 'JugadorYaExisteError';
  }
}
export const PlayerAlreadyExistsError = JugadorYaExisteError;
export type PlayerAlreadyExistsError = JugadorYaExisteError;

export class JugadorService {
  // EntityManager es el gestor de MikroORM que habla con la base de datos
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae todos los jugadores y los convierte al formato público
  async getAll(): Promise<JugadorPublicoDTO[]> {
    // populate: ['usuario'] le dice a MikroORM que también cargue los datos del Usuario asociado
    const jugadores = await this.em.find(Jugador, {}, { populate: ['usuario'] });
    return jugadores.filter((j) => !!j.usuario).map((j) => this.toPublicPlayer(j));
  }
  async obtenerTodos(): Promise<JugadorPublicoDTO[]> {
    return this.getAll();
  }

  // busca un jugador por el idUsuario (que es su clave primaria)
  async getById(idUsuario: number): Promise<JugadorPublicoDTO | null> {
    const jugador = await this.em.findOne(Jugador, idUsuario as any, { populate: ['usuario'] });
    return jugador ? this.toPublicPlayer(jugador) : null;
  }
  async obtenerPorId(idUsuario: number): Promise<JugadorPublicoDTO | null> {
    return this.getById(idUsuario);
  }

  // registra a un Usuario existente como Jugador
  async createPlayer(data: CrearJugadorDTO): Promise<JugadorPublicoDTO> {
    // regla 1: el Usuario debe existir antes de registrarlo como Jugador
    const usuario = await this.em.findOne(Usuario, { idUsuario: data.idUsuario });
    if (!usuario) {
      throw new UsuarioNoEncontradoError(data.idUsuario);
    }

    // regla 2: no puede registrarse dos veces como Jugador
    const jugadorExistente = await this.em.findOne(Jugador, data.idUsuario as any);
    if (jugadorExistente) {
      throw new JugadorYaExisteError(data.idUsuario);
    }

    // creo el Jugador vinculado al Usuario encontrado
    const jugador = this.em.create(Jugador, {
      usuario,           // la relacion OneToOne con el objeto Usuario completo
      estado: data.estado,
    });

    await this.em.flush(); // hace el INSERT real en la base de datos
    return this.toPublicPlayer(jugador);
  }
  async crearJugador(data: CrearJugadorDTO): Promise<JugadorPublicoDTO> {
    return this.createPlayer(data);
  }

  // actualiza el estado de un Jugador existente
  async updatePlayer(idUsuario: number, data: ActualizarJugadorDTO): Promise<JugadorPublicoDTO | null> {
    const jugador = await this.em.findOne(Jugador, idUsuario as any, { populate: ['usuario'] });
    if (!jugador) return null;

    // assign actualiza solo los campos que vienen en data (Partial)
    this.em.assign(jugador, data);
    await this.em.flush();
    return this.toPublicPlayer(jugador);
  }
  async actualizarJugador(idUsuario: number, data: ActualizarJugadorDTO): Promise<JugadorPublicoDTO | null> {
    return this.updatePlayer(idUsuario, data);
  }

  // quita el rol de Jugador a un Usuario (no borra el Usuario, solo la fila de jugadores)
  async deletePlayer(idUsuario: number): Promise<boolean> {
    const jugador = await this.em.findOne(Jugador, idUsuario as any);
    if (!jugador) return false;

    await this.em.removeAndFlush(jugador);
    return true;
  }
  async eliminarJugador(idUsuario: number): Promise<boolean> {
    return this.deletePlayer(idUsuario);
  }

  // convierte la entidad interna al DTO público (sin datos sensibles)
  private toPublicPlayer(j: Jugador): JugadorPublicoDTO {
    return {
      idUsuario: j.usuario.idUsuario,
      estado: j.estado,
      // datos del Usuario asociado para mostrar en el frontend
      nombreUsuario: j.usuario.nombreUsuario,
      nickname: j.usuario.nickname,
      imagen: j.usuario.imagen,
    };
  }
  private aJugadorPublico(j: Jugador): JugadorPublicoDTO {
    return this.toPublicPlayer(j);
  }
}

export { JugadorService as PlayerService };