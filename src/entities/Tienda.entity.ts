import { Entity, OptionalProps, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Clase } from './Clase.entity';

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
}
