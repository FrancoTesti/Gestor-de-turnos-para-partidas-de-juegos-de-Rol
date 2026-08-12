import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Clase } from './Clase.entity';
import { Jugador } from './Jugador.entity';
import { Partida } from './Partida.entity';

@Entity({ tableName: 'personajes' })
export class Personaje {
  @PrimaryKey({ type: 'number' })
  idPersonaje!: number;

  @Property({ type: 'string', length: 100 })
  nombreFicticio!: string;

  @Property({ type: 'string', length: 50 })
  raza!: string;

  @Property({ type: 'number' })
  xp!: number;

  @Property({ type: 'number' })
  nivel!: number;

  @Property({ type: 'number' })
  dinero!: number;

  // CF(idClase) -> Clase(idClase) NN
  @ManyToOne({ entity: () => Clase, fieldName: 'idClase' })
  clase!: Clase;

  // CF(idUsuarioJugador) -> Jugador(idUsuario) NN
  @ManyToOne({ entity: () => Jugador, fieldName: 'idUsuarioJugador' })
  jugador!: Jugador;

  // CF(idPartida) -> Partida(idPartida) NN
  @ManyToOne({ entity: () => Partida, fieldName: 'idPartida' })
  partida!: Partida;
}
