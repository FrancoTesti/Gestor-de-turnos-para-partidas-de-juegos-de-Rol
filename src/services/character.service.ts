import { EntityManager, LockMode } from '@mikro-orm/core';
import { Personaje } from '../entities/Character.entity';
import { Clase } from '../entities/Class.entity';
import { Jugador } from '../entities/Player.entity';
import { Partida } from '../entities/Match.entity';
import { Inventario } from '../entities/Inventory.entity';
import { Objeto } from '../entities/Item.entity';
import { PersonajeSesion } from '../entities/CharacterSession.entity';
import { ErrorValidacionPersonaje } from '../validators/character.validator';
import { verifyPassword } from '../security/password';
import type { ActualizarPersonajeDTO, CrearPersonajeDTO, PersonajePublicoDTO } from '../types/character.dto';

export class ErrorReferenciaNoEncontrada extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorReferenciaNoEncontrada';
  }
}
export const ReferenceNotFoundError = ErrorReferenciaNoEncontrada;
export type ReferenceNotFoundError = ErrorReferenciaNoEncontrada;

export class PersonajeService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async getAll(filtros?: { idClase?: number }): Promise<PersonajePublicoDTO[]> {
    const whereClause: Record<string, unknown> = {};
    if (filtros?.idClase) {
      whereClause.clase = { idClase: filtros.idClase };
    }

    const personajes = await this.em.find(
      Personaje,
      whereClause,
      { populate: ['clase', 'jugador', 'jugador.usuario', 'partida'] },
    );

    return personajes.map((p) => this.toPublicCharacter(p));
  }

  async getById(id: number): Promise<PersonajePublicoDTO | null> {
    const personaje = await this.em.findOne(
      Personaje,
      { idPersonaje: id },
      { populate: ['clase', 'jugador', 'jugador.usuario', 'partida'] },
    );

    return personaje ? this.toPublicCharacter(personaje) : null;
  }

  async createCharacter(data: CrearPersonajeDTO): Promise<PersonajePublicoDTO> {
    return this.em.transactional(async tx => new PersonajeService(tx).createInTransaction(data));
  }

  private async createInTransaction(data: CrearPersonajeDTO): Promise<PersonajePublicoDTO> {
    const clase = await this.em.findOne(Clase, { idClase: data.idClase });
    if (!clase) {
      throw new ErrorReferenciaNoEncontrada(`No existe la Clase con ID ${data.idClase}`);
    }

    const jugador = await this.em.findOne(Jugador, { usuario: { idUsuario: data.idUsuarioJugador } });
    if (!jugador) {
      throw new ErrorReferenciaNoEncontrada(`No existe el Jugador con ID de Usuario ${data.idUsuarioJugador}`);
    }

    const partida = await this.em.findOne(Partida, { idPartida: data.idPartida }, { lockMode: LockMode.PESSIMISTIC_WRITE });
    if (!partida) {
      throw new ErrorReferenciaNoEncontrada(`No existe la Partida con ID ${data.idPartida}`);
    }
    if (!partida.estado) throw new ErrorValidacionPersonaje('La partida está finalizada');
    if (!jugador.estado) throw new ErrorValidacionPersonaje('El jugador está inactivo');
    if (partida.contrasena && !await verifyPassword(data.contrasenaPartida ?? '', partida.contrasena)) throw new ErrorValidacionPersonaje('Contraseña de partida incorrecta');
    if (await this.em.count(Personaje, { partida }) >= partida.limiteJugadores) throw new ErrorValidacionPersonaje('La partida no tiene cupos disponibles');
    if (await this.em.count(Personaje, { partida, jugador }) > 0) throw new ErrorValidacionPersonaje('Ya tenés un personaje en esta partida');

    const nuevoPersonaje = this.em.create(Personaje, {
      nombreFicticio: data.nombreFicticio,
      raza: data.raza,
      nivel: 1,
      xp: 0,
      dinero: 100,
      clase: clase,
      jugador: jugador,
      partida: partida,
    });

    await this.em.flush();

    this.em.create(Inventario, { personaje: nuevoPersonaje, numInventario: 1, cantidadEspacio: 10 });
    await this.em.flush();
    await this.em.populate(nuevoPersonaje, ['clase', 'jugador', 'jugador.usuario', 'partida']);
    return this.toPublicCharacter(nuevoPersonaje);
  }

  async updateCharacter(id: number, data: ActualizarPersonajeDTO): Promise<PersonajePublicoDTO | null> {
    const personaje = await this.em.findOne(
      Personaje,
      { idPersonaje: id },
      { populate: ['clase', 'jugador', 'jugador.usuario', 'partida'] },
    );

    if (!personaje) return null;

    if (data.idClase !== undefined) {
      const clase = await this.em.findOne(Clase, { idClase: data.idClase });
      if (!clase) {
        throw new ErrorReferenciaNoEncontrada(`No existe la Clase con ID ${data.idClase}`);
      }
      personaje.clase = clase;
    }

    if (data.nombreFicticio !== undefined) personaje.nombreFicticio = data.nombreFicticio;
    if (data.raza !== undefined) personaje.raza = data.raza;

    await this.em.flush();
    await this.em.populate(personaje, ['clase', 'jugador', 'jugador.usuario', 'partida']);

    return this.toPublicCharacter(personaje);
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.em.transactional(async tx => new PersonajeService(tx).deleteInTransaction(id));
  }

  private async deleteInTransaction(id: number): Promise<boolean> {
    const personaje = await this.em.findOne(Personaje, { idPersonaje: id });
    if (!personaje) return false;

    if (await this.em.count(PersonajeSesion, { personaje }) > 0) throw new ErrorValidacionPersonaje('No se puede borrar un personaje con historial de sesiones');
    if (await this.em.count(Objeto, { inventario: { personaje } }) > 0) throw new ErrorValidacionPersonaje('Vendé los objetos antes de borrar el personaje');
    const inventarios = await this.em.find(Inventario, { personaje });
    this.em.remove(inventarios);

    await this.em.removeAndFlush(personaje);
    return true;
  }

  private toPublicCharacter(p: Personaje): PersonajePublicoDTO {
    return {
      idPersonaje: p.idPersonaje,
      nombreFicticio: p.nombreFicticio,
      raza: p.raza,
      xp: p.xp,
      nivel: p.nivel,
      dinero: p.dinero,
      idClase: p.clase ? p.clase.idClase : 0,
      claseNombre: p.clase ? p.clase.nombreClase : undefined,
      idUsuarioJugador: p.jugador && p.jugador.usuario ? p.jugador.usuario.idUsuario : 0,
      jugadorNombre: p.jugador && p.jugador.usuario ? (p.jugador.usuario.nickname || p.jugador.usuario.nombreUsuario) : undefined,
      idPartida: p.partida ? p.partida.idPartida : 0,
      partidaNombre: p.partida ? p.partida.nombre : undefined,
    };
  }
}

export { PersonajeService as CharacterService };
