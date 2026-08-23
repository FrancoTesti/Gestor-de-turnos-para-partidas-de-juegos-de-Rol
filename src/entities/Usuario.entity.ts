import { Entity, PrimaryKey, Property, OptionalProps } from '@mikro-orm/core';

@Entity({ tableName: 'usuarios' })
export class Usuario {
  [OptionalProps]?: 'idUsuario';

  @PrimaryKey({ type: 'number', autoincrement: true })
  idUsuario!: number;

  @Property({ type: 'string', length: 50 })
  nombreUsuario!: string;

  @Property({ type: 'string', length: 100 })
  contrasena!: string;

  @Property({ type: 'string', length: 255 })
  imagen!: string;

  @Property({ type: 'string', length: 50, unique: true })
  nickname!: string;
}