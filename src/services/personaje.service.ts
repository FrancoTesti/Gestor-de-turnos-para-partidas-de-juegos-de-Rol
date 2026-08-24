import { EntityManager } from '@mikro-orm/core';
import { Personaje } from '../entities/Personaje.entity';
import { Clase } from '../entities/Clase.entity';
import { Jugador } from '../entities/Jugador.entity';
import { Partida } from '../entities/Partida.entity';
import type { ActualizarPersonajeDTO, CrearPersonajeDTO, PersonajePublicoDTO } from '../types/personaje.dto';

export class ErrorReferenciaNoEncontrada extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorReferenciaNoEncontrada';
  }
}

export class PersonajeService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  async obtenerTodos(filtros?: { idClase?: number }): Promise<PersonajePublicoDTO[]> {
    const whereClause: Record<string, unknown> = {};
    if (filtros?.idClase) {
      whereClause.clase = { idClase: filtros.idClase };
    }

    const personajes = await this.em.find(
      Personaje,
      whereClause,
      { populate: ['clase', 'jugador', 'jugador.usuario', 'partida'] },
    );

    return personajes.map((p) => this.aPersonajePublico(p));
  }

  async obtenerPorId(id: number): Promise<PersonajePublicoDTO | null> {
    const personaje = await this.em.findOne(
      Personaje,
      { idPersonaje: id },
      { populate: ['clase', 'jugador', 'jugador.usuario', 'partida'] },
    );

    return personaje ? this.aPersonajePublico(personaje) : null;
  }

  async crearPersonaje(data: CrearPersonajeDTO): Promise<PersonajePublicoDTO> {
    const clase = await this.em.findOne(Clase, { idClase: data.idClase });
    if (!clase) {
      throw new ErrorReferenciaNoEncontrada(`No existe la Clase con ID ${data.idClase}`);
    }

    const jugador = await this.em.findOne(Jugador, { usuario: { idUsuario: data.idUsuarioJugador } });
    if (!jugador) {
      throw new ErrorReferenciaNoEncontrada(`No existe el Jugador con ID de Usuario ${data.idUsuarioJugador}`);
    }

    const partida = await this.em.findOne(Partida, { idPartida: data.idPartida });
    if (!partida) {
      throw new ErrorReferenciaNoEncontrada(`No existe la Partida con ID ${data.idPartida}`);
    }

    const nuevoPersonaje = this.em.create(Personaje, {
      nombreFicticio: data.nombreFicticio,
      raza: data.raza,
      nivel: data.nivel ?? 1,
      xp: data.xp ?? 0,
      dinero: data.dinero ?? 100,
      clase: clase,
      jugador: jugador,
      partida: partida,
    });

    await this.em.flush();

    await this.em.populate(nuevoPersonaje, ['clase', 'jugador', 'jugador.usuario', 'partida']);
    return this.aPersonajePublico(nuevoPersonaje);
  }

  async actualizarPersonaje(id: number, data: ActualizarPersonajeDTO): Promise<PersonajePublicoDTO | null> {
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

    if (data.idUsuarioJugador !== undefined) {
      const jugador = await this.em.findOne(Jugador, { usuario: { idUsuario: data.idUsuarioJugador } });
      if (!jugador) {
        throw new ErrorReferenciaNoEncontrada(`No existe el Jugador con ID de Usuario ${data.idUsuarioJugador}`);
      }
      personaje.jugador = jugador;
    }

    if (data.idPartida !== undefined) {
      const partida = await this.em.findOne(Partida, { idPartida: data.idPartida });
      if (!partida) {
        throw new ErrorReferenciaNoEncontrada(`No existe la Partida con ID ${data.idPartida}`);
      }
      personaje.partida = partida;
    }

    if (data.nombreFicticio !== undefined) personaje.nombreFicticio = data.nombreFicticio;
    if (data.raza !== undefined) personaje.raza = data.raza;
    if (data.nivel !== undefined) personaje.nivel = data.nivel;
    if (data.xp !== undefined) personaje.xp = data.xp;
    if (data.dinero !== undefined) personaje.dinero = data.dinero;

    await this.em.flush();
    await this.em.populate(personaje, ['clase', 'jugador', 'jugador.usuario', 'partida']);

    return this.aPersonajePublico(personaje);
  }

  async eliminarPersonaje(id: number): Promise<boolean> {
    const personaje = await this.em.findOne(Personaje, { idPersonaje: id });
    if (!personaje) return false;

    await this.em.removeAndFlush(personaje);
    return true;
  }

  private aPersonajePublico(p: Personaje): PersonajePublicoDTO {
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
