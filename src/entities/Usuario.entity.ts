import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'usuarios' })
export class Usuario {
  @PrimaryKey()
  idUsuario!: number;

  @Property({ length: 50 })
  nombreUsuario!: string;

  @Property({ length: 100 })
  contrasena!: string;

  @Property({ length: 255 })
  imagen!: string;

  @Property({ length: 50, unique: true })
  nickname!: string;
}