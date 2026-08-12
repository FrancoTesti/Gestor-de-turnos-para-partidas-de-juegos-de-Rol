import { EntityManager } from '@mikro-orm/core';
import { Usuario } from '../entities/Usuario.entity';
import type {
  ActualizarUsuarioDTO,
  CrearUsuarioDTO,
  UsuarioPublicoDTO,
} from '../types/usuario.dto';

export class NicknameEnUsoError extends Error {
  constructor() {
    super('El nickname ya está en uso');
    this.name = 'NicknameEnUsoError';
  }
}

export class UsuarioService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }
  async obtenerTodos(): Promise<UsuarioPublicoDTO[]> {
    const usuarios = await this.em.find(Usuario, {});
    return usuarios.map((usuario) => this.aUsuarioPublico(usuario));
  }

  async obtenerPorId(id: number): Promise<UsuarioPublicoDTO | null> {
    const usuario = await this.buscarEntidadPorId(id);
    return usuario ? this.aUsuarioPublico(usuario) : null;
  }

  async crearUsuario(data: CrearUsuarioDTO): Promise<UsuarioPublicoDTO> {
    await this.verificarNicknameDisponible(data.nickname);

    const usuario = this.em.create(Usuario, data);
    await this.em.flush();
    return this.aUsuarioPublico(usuario);
  }

  async actualizarUsuario(
    id: number,
    data: ActualizarUsuarioDTO,
  ): Promise<UsuarioPublicoDTO | null> {
    const usuario = await this.buscarEntidadPorId(id);
    if (!usuario) return null;

    if (data.nickname !== undefined) {
      await this.verificarNicknameDisponible(data.nickname, id);
    }

    this.em.assign(usuario, data);
    await this.em.flush();
    return this.aUsuarioPublico(usuario);
  }

  async eliminarUsuario(id: number): Promise<boolean> {
    const usuario = await this.buscarEntidadPorId(id);
    if (!usuario) return false;

    await this.em.removeAndFlush(usuario);
    return true;
  }

  private async buscarEntidadPorId(id: number): Promise<Usuario | null> {
    return this.em.findOne(Usuario, { idUsuario: id });
  }

  private async verificarNicknameDisponible(
    nickname: string,
    idUsuarioActual?: number,
  ): Promise<void> {
    const existente = await this.em.findOne(Usuario, { nickname });
    if (existente && existente.idUsuario !== idUsuarioActual) {
      throw new NicknameEnUsoError();
    }
  }

  private aUsuarioPublico(usuario: Usuario): UsuarioPublicoDTO {
    return {
      idUsuario: usuario.idUsuario,
      nombreUsuario: usuario.nombreUsuario,
      imagen: usuario.imagen,
      nickname: usuario.nickname,
    };
  }
}