// no sabe nada de Express (HTTP). Solo aplica reglas y habla con la BD.
import { EntityManager } from '@mikro-orm/core';
import { Jugador } from '../entities/Jugador.entity';
import { Usuario } from '../entities/Usuario.entity';
import type { ActualizarJugadorDTO, CrearJugadorDTO, JugadorPublicoDTO } from '../types/jugador.dto';

// error personalizado: el Usuario no existe en la BD
export class UsuarioNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún usuario con id ${id}`);
    this.name = 'UsuarioNoEncontradoError';
  }
}

// error personalizado: ese Usuario ya es Jugador (no puede registrarse dos veces)
export class JugadorYaExisteError extends Error {
  constructor(id: number) {
    super(`El usuario ${id} ya está registrado como jugador`);
    this.name = 'JugadorYaExisteError';
  }
}

export class JugadorService {
  // EntityManager es el gestor de MikroORM que habla con la base de datos
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae todos los jugadores y los convierte al formato público
  async obtenerTodos(): Promise<JugadorPublicoDTO[]> {
    // populate: ['usuario'] le dice a MikroORM que también cargue los datos del Usuario asociado
    const jugadores = await this.em.find(Jugador, {}, { populate: ['usuario'] });
    return jugadores.map((j) => this.aJugadorPublico(j));
  }

  // busca un jugador por el idUsuario (que es su clave primaria)
  async obtenerPorId(idUsuario: number): Promise<JugadorPublicoDTO | null> {
    const jugador = await this.em.findOne(Jugador, { usuario: idUsuario }, { populate: ['usuario'] });
    return jugador ? this.aJugadorPublico(jugador) : null;
  }

  // registra a un Usuario existente como Jugador
  async crearJugador(data: CrearJugadorDTO): Promise<JugadorPublicoDTO> {
    // regla 1: el Usuario debe existir antes de registrarlo como Jugador
    const usuario = await this.em.findOne(Usuario, { idUsuario: data.idUsuario });
    if (!usuario) {
      throw new UsuarioNoEncontradoError(data.idUsuario);
    }

    // regla 2: no puede registrarse dos veces como Jugador
    const jugadorExistente = await this.em.findOne(Jugador, { usuario: data.idUsuario });
    if (jugadorExistente) {
      throw new JugadorYaExisteError(data.idUsuario);
    }

    // creo el Jugador vinculado al Usuario encontrado
    const jugador = this.em.create(Jugador, {
      usuario,           // la relacion OneToOne con el objeto Usuario completo
      estado: data.estado,
    });

    await this.em.flush(); // hace el INSERT real en la base de datos
    return this.aJugadorPublico(jugador);
  }

  // actualiza el estado de un Jugador existente
  async actualizarJugador(idUsuario: number, data: ActualizarJugadorDTO): Promise<JugadorPublicoDTO | null> {
    const jugador = await this.em.findOne(Jugador, { usuario: idUsuario }, { populate: ['usuario'] });
    if (!jugador) return null;

    // assign actualiza solo los campos que vienen en data (Partial)
    this.em.assign(jugador, data);
    await this.em.flush();
    return this.aJugadorPublico(jugador);
  }

  // quita el rol de Jugador a un Usuario (no borra el Usuario, solo la fila de jugadores)
  async eliminarJugador(idUsuario: number): Promise<boolean> {
    const jugador = await this.em.findOne(Jugador, { usuario: idUsuario });
    if (!jugador) return false;

    await this.em.removeAndFlush(jugador);
    return true;
  }

  // convierte la entidad interna al DTO público (sin datos sensibles)
  private aJugadorPublico(j: Jugador): JugadorPublicoDTO {
    return {
      idUsuario: j.usuario.idUsuario,
      estado: j.estado,
      // datos del Usuario asociado para mostrar en el frontend
      nombreUsuario: j.usuario.nombreUsuario,
      nickname: j.usuario.nickname,
      imagen: j.usuario.imagen,
    };
  }
}