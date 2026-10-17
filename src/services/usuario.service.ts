import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { Usuario } from '../entities/Usuario.entity';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { hashPassword } from '../security/password';
import type { ActualizarUsuarioDTO, CrearUsuarioDTO, UsuarioPublicoDTO } from '../types/usuario.dto';

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
    const usuarios = await (this.repo.findAll ? this.repo.findAll() : this.repo.buscarTodos());
    return usuarios.map((usuario) => this.toPublicDTO(usuario));
  }
  async obtenerTodos(): Promise<UsuarioPublicoDTO[]> {
    return this.getAll();
  }

  // Pide un usuario y lo devuelve sin la contraseña
  async getById(id: number): Promise<UsuarioPublicoDTO | null> {
    const usuario = await (this.repo.findById ? this.repo.findById(id) : this.repo.buscarPorId(id));
    return usuario ? this.toPublicDTO(usuario) : null;
  }
  async obtenerPorId(id: number): Promise<UsuarioPublicoDTO | null> {
    return this.getById(id);
  }

  // Aplica la regla del nickname, manda a crearlo y lo guarda
  async create(data: CrearUsuarioDTO): Promise<UsuarioPublicoDTO> {
    await this.verifyNicknameAvailable(data.nickname);
    const createFn = this.repo.create ? this.repo.create.bind(this.repo) : this.repo.crear.bind(this.repo);
    const usuario = createFn({ ...data, contrasena: await hashPassword(data.contrasena) });
    try {
      if (this.repo.saveChanges) {
        await this.repo.saveChanges();
      } else {
        await this.repo.guardarCambios();
      }
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException || (error as { code?: string }).code === '23505') {
        throw new NicknameEnUsoError();
      }
      throw error;
    }
    return this.toPublicDTO(usuario);
  }
  async crearUsuario(data: CrearUsuarioDTO): Promise<UsuarioPublicoDTO> {
    return this.create(data);
  }

  // Aplica reglas, actualiza los datos y guarda
  async update(id: number, data: ActualizarUsuarioDTO): Promise<UsuarioPublicoDTO | null> {
    const findFn = this.repo.findById ? this.repo.findById.bind(this.repo) : this.repo.buscarPorId.bind(this.repo);
    const usuario = await findFn(id);
    if (!usuario) return null;
    if (data.nickname !== undefined) {
      await this.verifyNicknameAvailable(data.nickname, id);
    }
    const assignFn = this.repo.assign ? this.repo.assign.bind(this.repo) : this.repo.asignar.bind(this.repo);
    assignFn(usuario, { ...data, ...(data.contrasena !== undefined ? { contrasena: await hashPassword(data.contrasena) } : {}) });
    try {
      if (this.repo.saveChanges) {
        await this.repo.saveChanges();
      } else {
        await this.repo.guardarCambios();
      }
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException || (error as { code?: string }).code === '23505') {
        throw new NicknameEnUsoError();
      }
      throw error;
    }
    return this.toPublicDTO(usuario);
  }
  async actualizarUsuario(id: number, data: ActualizarUsuarioDTO): Promise<UsuarioPublicoDTO | null> {
    return this.update(id, data);
  }

  // Busca el usuario y, si existe, manda a borrarlo
  async delete(id: number): Promise<boolean> {
    const findFn = this.repo.findById ? this.repo.findById.bind(this.repo) : this.repo.buscarPorId.bind(this.repo);
    const usuario = await findFn(id);
    if (!usuario) return false;
    if (this.repo.delete) {
      await this.repo.delete(usuario);
    } else {
      await this.repo.eliminar(usuario);
    }
    return true;
  }
  async eliminarUsuario(id: number): Promise<boolean> {
    return this.delete(id);
  }

  // Lógica de negocio: asegura que no haya dos usuarios con el mismo nickname
  private async verifyNicknameAvailable(nickname: string, idUsuarioActual?: number): Promise<void> {
    const findNickFn = this.repo.findByNickname ? this.repo.findByNickname.bind(this.repo) : this.repo.buscarPorNickname.bind(this.repo);
    const existente = await findNickFn(nickname);
    if (existente && existente.idUsuario !== idUsuarioActual) {
      throw new NicknameEnUsoError();
    }
  }
  private async verificarNicknameDisponible(nickname: string, idUsuarioActual?: number): Promise<void> {
    return this.verifyNicknameAvailable(nickname, idUsuarioActual);
  }

  // Filtra los datos sensibles (como la contraseña) antes de mandarlos al controlador
  private toPublicDTO(usuario: Usuario): UsuarioPublicoDTO {
    return { idUsuario: usuario.idUsuario, nombreUsuario: usuario.nombreUsuario, imagen: usuario.imagen, nickname: usuario.nickname };
  }
  private aUsuarioPublico(usuario: Usuario): UsuarioPublicoDTO {
    return this.toPublicDTO(usuario);
  }
}
