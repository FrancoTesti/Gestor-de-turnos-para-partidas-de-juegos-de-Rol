import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { Usuario } from './Usuario.entity.js';

@Entity({ tableName: 'anfitriones' })
export class Anfitrion {
  @OneToOne({ entity: () => Usuario, primary: true, fieldName: 'idUsuario' })
  usuario!: Usuario;

  @Property()
  cantPartidasActuales!: number;

  @Property()
  karma!: number;
}