/* logica de negocio del modulo sesion.
 Incluye las reglas de calificación del anfitrión.
*/

import { EntityManager } from '@mikro-orm/core';
import { Anfitrion } from '../entities/Anfitrion.entity';
import { Partida } from '../entities/Partida.entity';
import { Personaje } from '../entities/Personaje.entity';
import { PersonajeSesion } from '../entities/PersonajeSesion.entity';
import { Sesion } from '../entities/Sesion.entity';
import type {
  ActualizarSesionDTO,
  CrearSesionDTO,
  EstadoSesion,
  SesionPublicaDTO,
} from '../types/sesion.dto';

export class PartidaNoEncontradaSesionError extends Error {
  constructor(id: number) {
    super(`No existe la partida con id ${id}`);
    this.name = 'PartidaNoEncontradaSesionError';
  }
}

export class SesionNoEncontradaError extends Error {
  constructor(idPartida: number, numSesion: number) {
    super(`No existe la sesión ${numSesion} en la partida ${idPartida}`);
    this.name = 'SesionNoEncontradaError';
  }
}

export class SesionDuplicadaError extends Error {
  constructor(idPartida: number, numSesion: number) {
    super(`Ya existe la sesión ${numSesion} en la partida ${idPartida}`);
    this.name = 'SesionDuplicadaError';
  }
}

export class KarmaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KarmaError';
  }
}

/* 
Convierte el estado entre números internos (0/1/2) 
y textos entendibles (planificada, en_curso, finalizada).
*/

function estadoANumero(estado: EstadoSesion): number {
  const mapa: Record<EstadoSesion, number> = {
    planificada: 0,
    en_curso: 1,
    finalizada: 2,
  };
  return mapa[estado];
}

function numeroAEstado(n: number): EstadoSesion {
  const mapa: Record<number, EstadoSesion> = {
    0: 'planificada',
    1: 'en_curso',
    2: 'finalizada',
  };
  return mapa[n] ?? 'planificada';
}


export class SesionService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // convierte la entidad al DTO publico (sin datos sensibles)
  private aSesionPublica(s: Sesion): SesionPublicaDTO {
    return {
      idPartida: s.partida.idPartida,
      numSesion: s.numSesion,
      duracionSesion: s.duracionSesion,
      cantJugadores: s.cantJugadores,
      estado: numeroAEstado(s.estadoSesion),
    };
  }

  // GET /api/sesiones?idPartida=X , trae todas las sesiones de una partida
  async obtenerPorPartida(idPartida: number): Promise<SesionPublicaDTO[]> {
    // verifico que la partida exista
    const partida = await this.em.findOne(Partida, { idPartida });
    if (!partida) throw new PartidaNoEncontradaSesionError(idPartida);

    const sesiones = await this.em.find(
      Sesion,
      { partida: idPartida as any },
      { populate: ['partida'], orderBy: { numSesion: 'ASC' } },
    );
    return sesiones.map((s) => this.aSesionPublica(s));
  }

  // GET /api/sesiones/:idPartida/:numSesion — trae una sesión específica
  async obtenerPorId(idPartida: number, numSesion: number): Promise<SesionPublicaDTO | null> {
    const sesion = await this.em.findOne(
      Sesion,
      { partida: idPartida as any, numSesion },
      { populate: ['partida'] },
    );
    return sesion ? this.aSesionPublica(sesion) : null;
  }

  // POST /api/sesiones — crea una nueva sesión
  async crearSesion(data: CrearSesionDTO): Promise<SesionPublicaDTO> {
    // regla 1: la partida debe existir
    const partida = await this.em.findOne(Partida, { idPartida: data.idPartida });
    if (!partida) throw new PartidaNoEncontradaSesionError(data.idPartida);

    // regla 2: la partida debe estar activa (no se pueden agregar sesiones a partidas finalizadas)
    if (!partida.estado) {
      throw new Error('No se pueden crear sesiones en una partida finalizada');
    }

    // regla 3: el numSesion no puede repetirse dentro de la misma partida
    const yaExiste = await this.em.findOne(Sesion, {
      partida: data.idPartida as any,
      numSesion: data.numSesion,
    });
    if (yaExiste) throw new SesionDuplicadaError(data.idPartida, data.numSesion);

    const sesion = this.em.create(Sesion, {
      partida,
      numSesion: data.numSesion,
      duracionSesion: data.duracionSesion,
      cantJugadores: data.cantJugadores,
      estadoSesion: estadoANumero(data.estado),
    });

    await this.em.flush();
    return this.aSesionPublica(sesion);
  }

  // PUT /api/sesiones/:idPartida/:numSesion — actualiza una sesión
  async actualizarSesion(
    idPartida: number,
    numSesion: number,
    data: ActualizarSesionDTO,
  ): Promise<SesionPublicaDTO | null> {
    const sesion = await this.em.findOne(
      Sesion,
      { partida: idPartida as any, numSesion },
      { populate: ['partida', 'partida.anfitrion'] },
    );
    if (!sesion) return null;

    if (data.duracionSesion !== undefined) sesion.duracionSesion = data.duracionSesion;
    if (data.cantJugadores !== undefined) sesion.cantJugadores = data.cantJugadores;

    if (data.estado !== undefined) {
      const estadoAnterior = sesion.estadoSesion;
      sesion.estadoSesion = estadoANumero(data.estado);

      /* cuando una sesión pasa a 'finalizada', recalculamos cantPartidasActuales
     contando desde la DB (no confiamos en el contador del cliente) */
      if (sesion.estadoSesion === 2 && estadoAnterior !== 2) {
        const anfitrion = sesion.partida.anfitrion as Anfitrion;
        const cantActivas = await this.em.count(Partida, {
          anfitrion: anfitrion as any,
          estado: true, // true = activa en la entidad
        });
        anfitrion.cantPartidasActuales = cantActivas;
      }
    }

    await this.em.flush();
    return this.aSesionPublica(sesion);
  }

  // DELETE /api/sesiones/:idPartida/:numSesion — elimina una sesión
  async eliminarSesion(idPartida: number, numSesion: number): Promise<boolean> {
    const sesion = await this.em.findOne(Sesion, {
      partida: idPartida as any,
      numSesion,
    });
    if (!sesion) return false;

    await this.em.remove(sesion).flush();;
    return true;
  }

  // POST /api/sesiones/:idPartida/:numSesion/karma — un personaje califica al anfitrión
  async darKarma(idPartida: number, numSesion: number, idPersonaje: number): Promise<void> {
    // paso 1: traer la sesión completa con el anfitrión
    const sesion = await this.em.findOne(
      Sesion,
      { partida: idPartida as any, numSesion },
      { populate: ['partida', 'partida.anfitrion', 'partida.anfitrion.usuario'] },
    );

    // regla 1: la sesión debe existir
    if (!sesion) throw new SesionNoEncontradaError(idPartida, numSesion);

    // regla 2: solo se califica cuando la sesión está finalizada
    if (sesion.estadoSesion !== 2) {
      throw new KarmaError('Solo se puede calificar al anfitrión cuando la sesión está finalizada');
    }

    // paso 2: traer el personaje con su jugador
    const personaje = await this.em.findOne(
      Personaje,
      { idPersonaje },
      { populate: ['jugador', 'jugador.usuario'] },
    );

    // regla 3: el personaje debe existir
    if (!personaje) throw new KarmaError('El personaje no existe');

    // regla 4: sin autocalificación — el jugador del personaje no puede ser el anfitrión
    const idUsuarioJugador = (personaje.jugador as any).usuario.idUsuario as number;
    const idUsuarioAnfitrion = sesion.partida.anfitrion.usuario.idUsuario;
    if (idUsuarioJugador === idUsuarioAnfitrion) {
      throw new KarmaError('El anfitrión no puede calificarse a sí mismo');
    }

    // regla 5: el personaje debe haber participado en la sesión
    const participacion = await this.em.findOne(PersonajeSesion, {
      personaje: idPersonaje as any,
      sesion: { partida: idPartida as any, numSesion } as any,
    });
    if (!participacion) {
      throw new KarmaError('El personaje no participó en esta sesión y no puede calificar');
    }

    // regla 6: voto único — no puede dar karma dos veces en la misma sesión
    if (participacion.dioKarma) {
      throw new KarmaError('Este personaje ya calificó al anfitrión en esta sesión');
    }

    /* todo ok: registramos el voto y sumamos karma */
    participacion.dioKarma = true;
    (sesion.partida.anfitrion as Anfitrion).karma += 1;

    await this.em.flush();
  }
    // participantes

  // GET /api/sesiones/:idPartida/:numSesion/participantes
  // devuelve los ids de personajes que participan en la sesión
  async obtenerParticipantes(idPartida: number, numSesion: number): Promise<number[]> {
    const sesion = await this.em.findOne(Sesion, { partida: idPartida as any, numSesion });
    if (!sesion) throw new SesionNoEncontradaError(idPartida, numSesion);

    const participaciones = await this.em.find(
      PersonajeSesion,
      { sesion: { partida: idPartida as any, numSesion } as any },
      { populate: ['personaje'] },
    );

    // devolvemos solo los ids de los personajes
    return participaciones.map((p) => (p.personaje as any).idPersonaje as number);
  }

  // POST /api/sesiones/:idPartida/:numSesion/participantes
  // registra un personaje como participante de la sesión
  async agregarParticipante(idPartida: number, numSesion: number, idPersonaje: number): Promise<void> {
    // regla 1: la sesión debe existir y no estar finalizada
    const sesion = await this.em.findOne(
      Sesion,
      { partida: idPartida as any, numSesion },
      { populate: ['partida'] },
    );
    if (!sesion) throw new SesionNoEncontradaError(idPartida, numSesion);
    if (sesion.estadoSesion === 2) {
      throw new KarmaError('No se pueden agregar participantes a una sesión finalizada');
    }

    // regla 2: el personaje debe existir Y pertenecer a esta partida
    const personaje = await this.em.findOne(Personaje, {
      idPersonaje,
      partida: idPartida as any,  // verifica pertenencia en una sola consulta
    });
    if (!personaje) {
      throw new KarmaError('El personaje no existe o no pertenece a esta partida');
    }

    // regla 3: no puede estar ya registrado en esta sesión
    const yaParticipa = await this.em.findOne(PersonajeSesion, {
      personaje: idPersonaje as any,
      sesion: { partida: idPartida as any, numSesion } as any,
    });
    if (yaParticipa) {
      throw new KarmaError('El personaje ya está registrado en esta sesión');
    }

    // regla 4: no superar el límite de jugadores de la partida
    const cantActual = await this.em.count(PersonajeSesion, {
      sesion: { partida: idPartida as any, numSesion } as any,
    });
    if (cantActual >= sesion.partida.limiteJugadores) {
      throw new KarmaError(`La sesión ya alcanzó el límite de ${sesion.partida.limiteJugadores} jugadores`);
    }

    /* todo ok: crear el registro en personaje_sesion con dioKarma = false */
    this.em.create(PersonajeSesion, {
      personaje,
      sesion,
      dioKarma: false,
    });
    await this.em.flush();
  }
}