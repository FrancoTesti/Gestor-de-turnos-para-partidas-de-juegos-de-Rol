import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Usuario } from '../entities/User.entity';
import { UsuarioRepository } from '../repositories/user.repository';
import { hashPassword } from '../security/password';
import type { ActualizarUsuarioDTO, CrearUsuarioDTO, UsuarioPublicoDTO } from '../types/user.dto';

/* -clase  personalizada para manejar errores de negocio (Herencia)
Nota: al poner "extends Error", esta clase hereda todo el comportamiento de un Error común de JS*/
export class NicknameEnUsoError extends Error {
  /* "static" significa que este valor le pertenece a la clase en si, no a cada instancia. Por eso
  puedo leerlo haciendo NicknameEnUsoError.CODIGO_HTTP sin tener que hacer un "new" primero */
  static readonly CODIGO_HTTP = 409;
  constructor() {
    super('El nickname ya está en uso');
    this.name = 'NicknameEnUsoError';
  }
}
export const NicknameInUseError = NicknameEnUsoError;
export type NicknameInUseError = NicknameEnUsoError;

/* Capa Service: Maneja la lógica de negocio pura. 
 No sabe nada de Express (HTTP) ni de MikroORM (BD).*/
export class UsuarioService {
  private repo: UsuarioRepository;
  // Límite privado con validación (Demuestra la teoría de Clases y Setters)
  #limiteResultados = 100;
  get limite() { return this.#limiteResultados; }
  set limite(valor: number) {
    if (valor <= 0) throw new Error('El límite debe ser un número positivo mayor a 0');
    this.#limiteResultados = valor;
  }
  // Recibimos el repositorio "inyectado" desde afuera
  constructor(repo: UsuarioRepository) {
    this.repo = repo;
  }
  // Pide todos los usuarios al repo y los limpia (saca la contraseña) antes de devolverlos
  async getAll(): Promise<UsuarioPublicoDTO[]> {
    const fn = (this.repo.findAll ?? this.repo.buscarTodos).bind(this.repo);
    const usuarios = await fn();
    return usuarios.map((usuario) => this.toPublicUser(usuario));
  }
  async obtenerTodos(): Promise<UsuarioPublicoDTO[]> {
    return this.getAll();
  }

  // Pide un usuario y lo devuelve sin la contraseña
  async getById(id: number): Promise<UsuarioPublicoDTO | null> {
    const fn = (this.repo.findById ?? this.repo.buscarPorId).bind(this.repo);
    const usuario = await fn(id);
    return usuario ? this.toPublicUser(usuario) : null;
  }
  async obtenerPorId(id: number): Promise<UsuarioPublicoDTO | null> {
    return this.getById(id);
  }

  // Aplica la regla del nickname, manda a crearlo y lo guarda
  async createUser(data: CrearUsuarioDTO): Promise<UsuarioPublicoDTO> {
    await this.checkNicknameAvailable(data.nickname); 
    const createFn = (this.repo.create ?? this.repo.crear).bind(this.repo);
    const saveFn = (this.repo.saveChanges ?? this.repo.guardarCambios).bind(this.repo);
    const usuario = createFn({ ...data, contrasena: await hashPassword(data.contrasena) });
    try {
      await saveFn();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException || (error as { code?: string }).code === '23505') {
        throw new NicknameEnUsoError();
      }
      throw error;
    }
    return this.toPublicUser(usuario);
  }
  async crearUsuario(data: CrearUsuarioDTO): Promise<UsuarioPublicoDTO> {
    return this.createUser(data);
  }

  // Aplica reglas, actualiza los datos y guarda
  async updateUser(id: number, data: ActualizarUsuarioDTO): Promise<UsuarioPublicoDTO | null> {
    const findFn = (this.repo.findById ?? this.repo.buscarPorId).bind(this.repo);
    const usuario = await findFn(id);
    if (!usuario) return null;
    if (data.nickname !== undefined) {
      await this.checkNicknameAvailable(data.nickname, id);
    }
    const assignFn = (this.repo.assign ?? this.repo.asignar).bind(this.repo);
    const saveFn = (this.repo.saveChanges ?? this.repo.guardarCambios).bind(this.repo);
    assignFn(usuario, { ...data, ...(data.contrasena !== undefined ? { contrasena: await hashPassword(data.contrasena) } : {}) });
    try {
      await saveFn();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException || (error as { code?: string }).code === '23505') {
        throw new NicknameEnUsoError();
      }
      throw error;
    }
    return this.toPublicUser(usuario);
  }
  async actualizarUsuario(id: number, data: ActualizarUsuarioDTO): Promise<UsuarioPublicoDTO | null> {
    return this.updateUser(id, data);
  }

  // Busca el usuario y, si existe, manda a borrarlo
  async deleteUser(id: number): Promise<boolean> {
    const findFn = (this.repo.findById ?? this.repo.buscarPorId).bind(this.repo);
    const usuario = await findFn(id);
    if (!usuario) return false;
    const deleteFn = (this.repo.delete ?? this.repo.eliminar).bind(this.repo);
    await deleteFn(usuario);
    return true;
  }
  async eliminarUsuario(id: number): Promise<boolean> {
    return this.deleteUser(id);
  }

  // Lógica de negocio: asegura que no haya dos usuarios con el mismo nickname
  private async checkNicknameAvailable(nickname: string, idUsuarioActual?: number): Promise<void> {
    const findNickFn = (this.repo.findByNickname ?? this.repo.buscarPorNickname).bind(this.repo);
    const existente = await findNickFn(nickname);
    if (existente && existente.idUsuario !== idUsuarioActual) {
      throw new NicknameEnUsoError();
    }
  }
  private async verificarNicknameDisponible(nickname: string, idUsuarioActual?: number): Promise<void> {
    return this.checkNicknameAvailable(nickname, idUsuarioActual);
  }

  // Filtra los datos sensibles (como la contraseña) antes de mandarlos al controlador
  private toPublicUser(usuario: Usuario): UsuarioPublicoDTO {
    return { idUsuario: usuario.idUsuario, nombreUsuario: usuario.nombreUsuario, imagen: usuario.imagen, nickname: usuario.nickname };
  }
  private aUsuarioPublico(usuario: Usuario): UsuarioPublicoDTO {
    return this.toPublicUser(usuario);
  }
}

export { UsuarioService as UserService };
