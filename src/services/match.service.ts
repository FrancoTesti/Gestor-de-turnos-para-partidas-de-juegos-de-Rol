import { EntityManager, LockMode } from '@mikro-orm/core';
import { Sesion } from '../entities/Session.entity';
import { Partida } from '../entities/Match.entity';
import { Anfitrion } from '../entities/Host.entity';
import { Personaje } from '../entities/Character.entity';
import { Tienda } from '../entities/Shop.entity';
import { Mision } from '../entities/Mission.entity';
import { PersonajeSesion } from '../entities/CharacterSession.entity';
import { Inventario } from '../entities/Inventory.entity';
import { Objeto } from '../entities/Item.entity';
import { ErrorValidacion as ErrorValidacionPartida } from '../shared/validate';
import { hashPassword } from '../security/password';
import type { ActualizarPartidaDTO, CrearPartidaDTO, EstadoPartida, PartidaPublicaDTO } from '../types/match.dto';

// error personalizado: el Anfitrion que se quiere asignar no existe
export class AnfitrionNoEncontradoError extends Error {
  constructor(id: number) {
    super(`No existe ningún anfitrión con id ${id}`);
    this.name = 'AnfitrionNoEncontradoError';
  }
}
export const HostNotFoundError = AnfitrionNoEncontradoError;
export type HostNotFoundError = AnfitrionNoEncontradoError;

export class PartidaService {
  private em: EntityManager;

  constructor(em: EntityManager) {
    this.em = em;
  }

  // trae TODAS las partidas con los datos del anfitrion
  async getAll(): Promise<PartidaPublicaDTO[]> {
    // populate anida la carga: primero carga Anfitrion, luego el Usuario del Anfitrion
    const partidas = await this.em.find(Partida, {}, { populate: ['anfitrion', 'anfitrion.usuario'] });
    return partidas.map((p) => this.toPublicMatch(p));
  }

  // trae solo las partidas ACTIVAS (para el listado requerido por el plan)
  async getActive(): Promise<PartidaPublicaDTO[]> {
    // estado: true en la BD significa 'activa' en el DTO
    const partidas = await this.em.find(
      Partida,
      { estado: true },
      { populate: ['anfitrion', 'anfitrion.usuario'] },
    );
    return partidas.map((p) => this.toPublicMatch(p));
  }

  // busca una partida por su id
  async getById(id: number): Promise<PartidaPublicaDTO | null> {
    const partida = await this.em.findOne(
      Partida,
      { idPartida: id },
      { populate: ['anfitrion', 'anfitrion.usuario'] },
    );
    return partida ? this.toPublicMatch(partida) : null;
  }

  // crea una partida nueva aplicando todas las reglas de negocio
  async createMatch(data: CrearPartidaDTO): Promise<PartidaPublicaDTO> {
    // regla 1: el Anfitrion debe existir antes de crear la partida
    const anfitrion = await this.em.findOne(
      Anfitrion,
      data.idUsuarioAnfitrion as any,
      { populate: ['usuario'] },
    );
    if (!anfitrion) {
      throw new AnfitrionNoEncontradoError(data.idUsuarioAnfitrion);
    }

    /* Conversión DTO -> entidad:
     - 'activa' -> true  |  'finalizada' -> false
     - esPrivada con contrasena -> contrasena como string  |  publica -> string vacio ""*/
    const partida = this.em.create(Partida, {
      nombre: data.nombre,
      estado: data.estado === 'activa',             // conversión string -> boolean
      limiteJugadores: data.limiteJugadores,
      contrasena: data.esPrivada ? await hashPassword(data.contrasena!) : '', // '' = pública 
      // // await antes de una Promesa para esperar que la tarea termine y obtener su resultado real.
      anfitrion,
    } as any); // 'as any' porque TypeScript no infiere que idPartida es autoincrement

    await this.em.flush();
    return this.toPublicMatch(partida);
  }

  // actualiza los campos que lleguen en el body
  async updateMatch(id: number, data: ActualizarPartidaDTO): Promise<PartidaPublicaDTO | null> {
    return this.em.transactional(tx => new PartidaService(tx).updateInTransaction(id, data));
  }

  private async updateInTransaction(id: number, data: ActualizarPartidaDTO): Promise<PartidaPublicaDTO | null> {
    const partida = await this.em.findOne(
      Partida,
      { idPartida: id },
      { populate: ['anfitrion', 'anfitrion.usuario'], lockMode: LockMode.PESSIMISTIC_WRITE },
    );
    if (!partida) return null;
    if (data.estado === 'finalizada' && await this.em.count(Sesion, { partida, estadoSesion: 1 }) > 0) throw new ErrorValidacionPartida('Finalizá primero la sesión en curso');

    const privada = data.esPrivada ?? (partida.contrasena !== '');
    const password = privada ? (data.contrasena ?? partida.contrasena) : '';
    if (privada && !password.trim()) throw new ErrorValidacionPartida('Para hacer privada una partida pública debés indicar una contraseña');
    if (data.esPrivada === false && data.contrasena) throw new ErrorValidacionPartida('Una partida pública no debe tener contraseña');
    if (data.esPrivada === undefined && !privada && data.contrasena) throw new ErrorValidacionPartida('Indicá esPrivada para establecer una contraseña');
    if (data.limiteJugadores !== undefined) {
      const cantidad = await this.em.count(Personaje, { partida });
      if (data.limiteJugadores < cantidad) throw new ErrorValidacionPartida('El límite no puede ser menor que los personajes inscritos');
    }

    // actualizamos solo los campos que llegaron
    if (data.nombre !== undefined) partida.nombre = data.nombre;
    if (data.limiteJugadores !== undefined) partida.limiteJugadores = data.limiteJugadores;
    if (data.estado !== undefined) partida.estado = data.estado === 'activa';
    partida.contrasena = privada && data.contrasena !== undefined ? await hashPassword(data.contrasena) : password;

    await this.em.flush();
    return this.toPublicMatch(partida);
  }

  // elimina una partida y todas sus relaciones en cascada (transaccional)
  async deleteMatch(id: number): Promise<boolean> {
    return this.em.transactional(async (tx) => {
      const partida = await tx.findOne(Partida, { idPartida: id });
      if (!partida) return false;

      // 1. Desvincular tiendas asociadas a la partida
      const tiendas = await tx.find(Tienda, { partida });
      for (const t of tiendas) {
        t.partida = null;
      }

      // 2. Sesiones de la partida y sus hijas (misiones y asistencias)
      const sesiones = await tx.find(Sesion, { partida });
      for (const sesion of sesiones) {
        const misiones = await tx.find(Mision, { sesion });
        for (const m of misiones) {
          tx.remove(m);
        }
        const asistencias = await tx.find(PersonajeSesion, { sesion });
        for (const a of asistencias) {
          tx.remove(a);
        }
        tx.remove(sesion);
      }

      // 3. Personajes de la partida y sus inventarios / objetos
      const personajes = await tx.find(Personaje, { partida });
      for (const pj of personajes) {
        // Asistencias restantes que pertenezcan a este personaje
        const asistenciasPj = await tx.find(PersonajeSesion, { personaje: pj });
        for (const a of asistenciasPj) {
          tx.remove(a);
        }

        const inventarios = await tx.find(Inventario, { personaje: pj });
        for (const inv of inventarios) {
          // Desasociar objetos que estén en ese inventario
          const objetosEnInv = await tx.find(Objeto, { inventario: inv });
          for (const obj of objetosEnInv) {
            obj.inventario = null;
          }
          tx.remove(inv);
        }
        tx.remove(pj);
      }

      // 4. Eliminar la partida
      tx.remove(partida);
      await tx.flush();
      return true;
    });
  }

  // convierte la entidad al DTO publico (sin exponer la contraseña)
  private toPublicMatch(p: Partida): PartidaPublicaDTO {
    return {
      idPartida: p.idPartida,
      nombre: p.nombre,
      // conversion inversa: boolean -> string legible
      estado: p.estado ? 'activa' : 'finalizada',
      limiteJugadores: p.limiteJugadores,
      // una partida es privada si tiene contraseña no vaciaa
      esPrivada: p.contrasena !== '',
      // NUNCA devuelvo la contraseña (igual que con la contraseña del usuario)
      idUsuarioAnfitrion: p.anfitrion.usuario.idUsuario,
      nicknameAnfitrion: p.anfitrion.usuario.nickname,
    };
  }
}

export { PartidaService as MatchService };
