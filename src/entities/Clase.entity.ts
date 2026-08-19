import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'clases' })
export class Clase {
  [OptionalProps]?: 'idClase';

  @PrimaryKey({ type: 'number', autoincrement: true })
  idClase!: number;

  @Property({ type: 'string', length: 50 })
  nombreClase!: string;

  @Property({ type: 'text' })
  descripcionClase!: string;
}
