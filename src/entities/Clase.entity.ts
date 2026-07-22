import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'clases' })
export class Clase {
  @PrimaryKey({ type: 'number' })
  idClase!: number;

  @Property({ type: 'string', length: 50 })
  nombreClase!: string;

  // Las descripciones de clase son largas (ver SQL/rpg.sql) -> TEXT, no VARCHAR
  @Property({ type: 'text' })
  descripcionClase!: string;
}
