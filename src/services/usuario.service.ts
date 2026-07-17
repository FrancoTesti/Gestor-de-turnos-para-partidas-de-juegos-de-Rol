import { EntityManager } from '@mikro-orm/core';
import { Usuario } from '../entities/Usuario.entity';

export class UsuarioService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }
  async obtenerTodos() {
    return await this.em.find(Usuario, {});
  }

  async obtenerPorId(id: number) {
    return await this.em.findOne(Usuario, { idUsuario: id });
  }

  async crearUsuario(data: any) {
    const usuario = this.em.create(Usuario, data);
    await this.em.flush();
    return usuario;
  }

  async actualizarUsuario(id: number, data: any) {
    const usuario = await this.obtenerPorId(id);
    if (!usuario) return null;
    
    this.em.assign(usuario, data);
    await this.em.flush();
    return usuario;
  }

  async eliminarUsuario(id: number) {
    const usuario = await this.obtenerPorId(id);
    if (!usuario) return false;
    
    await this.em.removeAndFlush(usuario);
    return true;
  }
}