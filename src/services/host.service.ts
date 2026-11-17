// no sabe nada de Express (HTTP). Solo aplica reglas y habla con la BD.
import { EntityManager } from '@mikro-orm/core';
import { Anfitrion } from '../entities/Host.entity';
import { Usuario } from '../entities/User.entity';
import { Partida } from '../entities/Match.entity';
import type { AnfitrionPublicoDTO, CrearAnfitrionDTO } from '../types/host.dto';

// error  personalizado: el Usuario no existe en la BD
export class UsuarioNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún usuario con id ${id}`);
    this.name = 'UsuarioNoEncontradoError';
  }
}
export const UserNotFoundError = UsuarioNoEncontradoError;
export type UserNotFoundError = UsuarioNoEncontradoError;

// error personalizado: ese Usuario ya es Anfitrion
export class AnfitrionYaExisteError extends Error {
  constructor(id: number) {
    super(`El usuario ${id} ya está registrado como anfitrión`);
    this.name = 'AnfitrionYaExisteError';
  }
}
export const HostAlreadyExistsError = AnfitrionYaExisteError;
export type HostAlreadyExistsError = AnfitrionYaExisteError;

export class AnfitrionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae todos los anfitriones con los datos de su Usuario
  async getAll(): Promise<AnfitrionPublicoDTO[]> {
    const anfitriones = await this.em.find(Anfitrion, {}, { populate: ['usuario'] });
    return Promise.all(anfitriones.filter((a) => !!a.usuario).map((a) => this.toPublicHost(a)));
  }

  // busca un anfitrion por el idUsuario
  async getById(idUsuario: number): Promise<AnfitrionPublicoDTO | null> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any, { populate: ['usuario'] });
    return anfitrion ? this.toPublicHost(anfitrion) : null;
  }

  // registra a un Usuario existente como Anfitrion
  async createHost(data: CrearAnfitrionDTO): Promise<AnfitrionPublicoDTO> {
    // regla 1: el Usuario debe existir antes de registrarlo como Anfitrion
    const usuario = await this.em.findOne(Usuario, { idUsuario: data.idUsuario });
    if (!usuario) {
      throw new UsuarioNoEncontradoError(data.idUsuario);
    }

    // regla 2: no puede registrarse dos veces como Anfitrion
    const anfitrionExistente = await this.em.findOne(Anfitrion, data.idUsuario as any);
    if (anfitrionExistente) {
      throw new AnfitrionYaExisteError(data.idUsuario);
    }

    const anfitrion = this.em.create(Anfitrion, {
      usuario,
      cantPartidasActuales: data.cantPartidasActuales,
      karma: data.karma,
    });

    await this.em.flush();
    return this.toPublicHost(anfitrion);
  }

  // quita el rol de Anfitrion (no borra el Usuario!!!!!!!!!!!!)
  async deleteHost(idUsuario: number): Promise<boolean> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any);
    if (!anfitrion) return false;

    await this.em.removeAndFlush(anfitrion);
    return true;
  }

  // convierte la entidad al DTO público
  private async toPublicHost(a: Anfitrion): Promise<AnfitrionPublicoDTO> {
    return {
      idUsuario: a.usuario.idUsuario,
      cantPartidasActuales: await this.em.count(Partida, { anfitrion: a, estado: true }),
      karma: a.karma,
      nombreUsuario: a.usuario.nombreUsuario,
      nickname: a.usuario.nickname,
      imagen: a.usuario.imagen,
    };
  }
}

export { AnfitrionService as HostService };
