import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { Usuario } from './User.entity';

@Entity({ tableName: 'anfitriones' })
export class Anfitrion {
  @OneToOne({ entity: () => Usuario, primary: true, fieldName: 'idUsuario' })
  usuario!: Usuario;

  @Property({ type: 'number' })
  cantPartidasActuales!: number;

  @Property({ type: 'number' })
  karma!: number;
}

export const Host = Anfitrion;
export type Host = Anfitrion;