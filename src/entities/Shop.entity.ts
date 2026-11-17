import { Entity, OptionalProps, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Clase } from './Class.entity';
import { Partida } from './Match.entity';

@Entity({ tableName: 'tiendas' })
export class Tienda {
  [OptionalProps]?: 'idTienda';

  @PrimaryKey({ type: 'number', autoincrement: true })
  idTienda!: number;

  @Property({ type: 'string', length: 50 })
  claseTienda!: string;

  @Property({ type: 'string', length: 100 })
  nombre!: string;

  @ManyToOne({ entity: () => Clase, fieldName: 'idClase', nullable: true })
  clase?: Clase | null;

  @ManyToOne({ entity: () => Partida, fieldName: 'idPartida', nullable: true })
  partida?: Partida | null;
}

export const Shop = Tienda;
export type Shop = Tienda;
