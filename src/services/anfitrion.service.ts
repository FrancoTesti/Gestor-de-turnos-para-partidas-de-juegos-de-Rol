// no sabe nada de Express (HTTP). Solo aplica reglas y habla con la BD.
import { EntityManager } from '@mikro-orm/core';
import { Anfitrion } from '../entities/Anfitrion.entity';
import { Usuario } from '../entities/Usuario.entity';
import type { ActualizarAnfitrionDTO, AnfitrionPublicoDTO, CrearAnfitrionDTO } from '../types/anfitrion.dto';

// error  personalizado: el Usuario no existe en la BD
export class UsuarioNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún usuario con id ${id}`);
    this.name = 'UsuarioNoEncontradoError';
  }
}

// error personalizado: ese Usuario ya es Anfitrion
export class AnfitrionYaExisteError extends Error {
  constructor(id: number) {
    super(`El usuario ${id} ya está registrado como anfitrión`);
    this.name = 'AnfitrionYaExisteError';
  }
}

export class AnfitrionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae todos los anfitriones con los datos de su Usuario
  async obtenerTodos(): Promise<AnfitrionPublicoDTO[]> {
    const anfitriones = await this.em.find(Anfitrion, {}, { populate: ['usuario'] });
    return anfitriones.map((a) => this.aAnfitrionPublico(a));
  }

  // busca un anfitrion por el idUsuario
  async obtenerPorId(idUsuario: number): Promise<AnfitrionPublicoDTO | null> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any, { populate: ['usuario'] });
    return anfitrion ? this.aAnfitrionPublico(anfitrion) : null;
  }

  // registra a un Usuario existente como Anfitrion
  async crearAnfitrion(data: CrearAnfitrionDTO): Promise<AnfitrionPublicoDTO> {
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
    return this.aAnfitrionPublico(anfitrion);
  }

  // actualiza karma o cantPartidasActuales
  async actualizarAnfitrion(idUsuario: number, data: ActualizarAnfitrionDTO): Promise<AnfitrionPublicoDTO | null> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any, { populate: ['usuario'] });
    if (!anfitrion) return null;

    this.em.assign(anfitrion, data);
    await this.em.flush();
    return this.aAnfitrionPublico(anfitrion);
  }

  // quita el rol de Anfitrion (no borra el Usuario!!!!!!!!!!!!)
  async eliminarAnfitrion(idUsuario: number): Promise<boolean> {
    const anfitrion = await this.em.findOne(Anfitrion, idUsuario as any);
    if (!anfitrion) return false;

    await this.em.removeAndFlush(anfitrion);
    return true;
  }

  // convierte la entidad al DTO público
  private aAnfitrionPublico(a: Anfitrion): AnfitrionPublicoDTO {
    return {
      idUsuario: a.usuario.idUsuario,
      cantPartidasActuales: a.cantPartidasActuales,
      karma: a.karma,
      nombreUsuario: a.usuario.nombreUsuario,
      nickname: a.usuario.nickname,
      imagen: a.usuario.imagen,
    };
  }
}