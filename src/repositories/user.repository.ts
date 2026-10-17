/* 
Chicos, arme la carpeta repositories con el archivo usuario.repository.ts para cumplir al 100% con la 
presentación de Arquitecturas de la facu. El profe pide que el Service no hable directamente con
la base de datos (MikroORM), sino que se dedique solo a la lógica de negocio. Con este repo nuevo, 
separamos las responsabilidades perfecto (onda Clean Architecture): el Controller ataja el HTTP, el 
service maneja las reglas y el Repository es el único que sabe cómo guardar los datos.
*/
import { EntityManager } from '@mikro-orm/core';
/* nota: el entitymanager es el gestor central de MikroORM que
controla todas las operaciones con la base de datos ( crear, leer,actualizar, borrar). Lo inyectamos en el constructor para poder usarlo */

import { Usuario } from '../entities/User.entity';
import { Jugador } from '../entities/Player.entity';
import { Anfitrion } from '../entities/Host.entity';
import type { CrearUsuarioDTO } from '../types/user.dto';
/* capa repository: Separa la base de datos del resto de la aplicacion
Solo este archivo sabe que estamos usando MikroORM (Arquitectura Limpia) */
export class UsuarioRepository {
  private em: EntityManager;
  constructor(em: EntityManager) {
    this.em = em; // guardamos la conexión a la BD
  }
  // trae todos los usuarios de la tabla
  async findAll(): Promise<Usuario[]> {
    return this.em.find(Usuario, {});
  }
  async buscarTodos(): Promise<Usuario[]> {
    return this.findAll();
  }
  // busca un usuario puntual usando su ID
  async findById(id: number): Promise<Usuario | null> {
    return this.em.findOne(Usuario, { idUsuario: id });
  }
  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.findById(id);
  }
  // busca si un nickname en particular ya existe en la tabla
  async findByNickname(nickname: string): Promise<Usuario | null> {
    return this.em.findOne(Usuario, { nickname });
  }
  async buscarPorNickname(nickname: string): Promise<Usuario | null> {
    return this.findByNickname(nickname);
  }
  // arma el objeto de usuario en memoria (todavía no lo guarda en la BD)
  create(datos: CrearUsuarioDTO): Usuario {
    return this.em.create(Usuario, datos);
  }
  crear(datos: CrearUsuarioDTO): Usuario {
    return this.create(datos);
  }
  // actualiza los datos de un usuario existente en memoria
  assign(usuario: Usuario, datos: Partial<Usuario>): void {
    this.em.assign(usuario, datos);
  }
  asignar(usuario: Usuario, datos: Partial<Usuario>): void {
    this.assign(usuario, datos);
  }
  // impacta todos los cambios pendientes en la base de datos (Hace el INSERT/UPDATE real)
  async saveChanges(): Promise<void> {
    await this.em.flush();
  }
  async guardarCambios(): Promise<void> {
    await this.saveChanges();
  }
  // borra un usuario de la base de datos definitivamente
  async delete(usuario: Usuario): Promise<void> {
    await this.em.transactional(async tx => {
      const roles = [...await tx.find(Jugador, { usuario }), ...await tx.find(Anfitrion, { usuario })];
      tx.remove(roles);
      tx.remove(usuario);
      await tx.flush();
    });
  }
  async eliminar(usuario: Usuario): Promise<void> {
    await this.delete(usuario);
  }
}

export { UsuarioRepository as UserRepository };
