import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { Usuario } from './Usuario.entity';

@Entity({ tableName: 'anfitriones' })
export class Anfitrion {
  @OneToOne({ entity: () => Usuario, primary: true, fieldName: 'idUsuario' })
  usuario!: Usuario;

  @Property({ type: 'number' })
  cantPartidasActuales!: number;

  @Property({ type: 'number' })
  karma!: number;
}