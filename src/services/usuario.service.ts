import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Usuario } from '../entities/Usuario.entity';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { hashPassword } from '../security/password';
import type { ActualizarUsuarioDTO, CrearUsuarioDTO, UsuarioPublicoDTO } from '../types/usuario.dto';

/* -clase personalizada para manejar errores de negocio (Herencia)
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

/* Capa Service: Maneja la lógica de negocio pura. 
 No sabe nada de Express (HTTP) ni de MikroORM (BD).*/
export class UsuarioService {
  private repo: UsuarioRepository;
  // Límite privado con validación (Demuestra la teoría de Clases y Setters)
  #limiteResultados = 100;
  get limite() { return this.#limiteResultados; }
  set limite(valor: number) {
    if (valor <= 0) throw new Error("El límite debe ser un número positivo");
    this.#limiteResultados = valor;
  }
  // Recibimos el repositorio "inyectado" desde afuera
  constructor(repo: UsuarioRepository) {
    this.repo = repo;
  }
  // Pide todos los usuarios al repo y los limpia (saca la contraseña) antes de devolverlos
  async getAll(): Promise<UsuarioPublicoDTO[]> {
    const usuarios = await this.repo.findAll();
    return usuarios.map((usuario: Usuario) => this.toPublicDTO(usuario));
  }

  // Pide un usuario y lo devuelve sin la contraseña
  async getById(id: number): Promise<UsuarioPublicoDTO | null> {
    const usuario = await this.repo.findById(id);
    return usuario ? this.toPublicDTO(usuario) : null;
  }

  // Aplica la regla del nickname, manda a crearlo y lo guarda
  async create(data: CrearUsuarioDTO): Promise<UsuarioPublicoDTO> {
    await this.verifyNicknameAvailable(data.nickname);
    const usuario = this.repo.create({ ...data, contrasena: await hashPassword(data.contrasena) });
    try {
      await this.repo.saveChanges();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException || (error as { code?: string }).code === '23505') {
        throw new NicknameEnUsoError();
      }
      throw error;
    }
    return this.toPublicDTO(usuario);
  }

  // Aplica reglas, actualiza los datos y guarda
  async update(id: number, data: ActualizarUsuarioDTO): Promise<UsuarioPublicoDTO | null> {
    const usuario = await this.repo.findById(id);
    if (!usuario) return null;
    if (data.nickname !== undefined) {
      await this.verifyNicknameAvailable(data.nickname, id);
    }
    this.repo.assign(usuario, { ...data, ...(data.contrasena !== undefined ? { contrasena: await hashPassword(data.contrasena) } : {}) });
    try {
      await this.repo.saveChanges();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException || (error as { code?: string }).code === '23505') {
        throw new NicknameEnUsoError();
      }
      throw error;
    }
    return this.toPublicDTO(usuario);
  }

  // Busca el usuario y, si existe, manda a borrarlo
  async delete(id: number): Promise<boolean> {
    const usuario = await this.repo.findById(id);
    if (!usuario) return false;
    await this.repo.delete(usuario);
    return true;
  }

  // Lógica de negocio: asegura que no haya dos usuarios con el mismo nickname
  private async verifyNicknameAvailable(nickname: string, idUsuarioActual?: number): Promise<void> {
    const existente = await this.repo.findByNickname(nickname);
    if (existente && existente.idUsuario !== idUsuarioActual) {
      throw new NicknameEnUsoError();
    }
  }

  // Filtra los datos sensibles (como la contraseña) antes de mandarlos al controlador
  private toPublicDTO(usuario: Usuario): UsuarioPublicoDTO {
    return { idUsuario: usuario.idUsuario, nombreUsuario: usuario.nombreUsuario, imagen: usuario.imagen, nickname: usuario.nickname };
  }
}
