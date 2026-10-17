import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { Usuario } from './User.entity';

@Entity({ tableName: 'jugadores' })
export class Jugador {
  @OneToOne({ entity: () => Usuario, primary: true, fieldName: 'idUsuario' })
  usuario!: Usuario;

  @Property({ type: 'boolean' })
  estado!: boolean;
}

export const Player = Jugador;
export type Player = Jugador;