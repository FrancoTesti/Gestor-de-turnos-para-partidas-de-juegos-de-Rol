import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { Usuario } from './Usuario.entity';

@Entity({ tableName: 'jugadores' })
export class Jugador {
  @OneToOne({ entity: () => Usuario, primary: true, fieldName: 'idUsuario' })
  usuario!: Usuario;

  @Property({ type: 'boolean' })
  estado!: boolean;
}