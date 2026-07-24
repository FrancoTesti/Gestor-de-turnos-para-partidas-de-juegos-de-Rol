import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Clase } from './Clase.entity.js';

@Entity({ tableName: 'tiendas' })
export class Tienda {
  @PrimaryKey({ type: 'number' })
  idTienda!: number;

  @Property({ type: 'string', length: 50 })
  claseTienda!: string;

  @Property({ type: 'string', length: 100 })
  nombre!: string;

  // CF(idClase) -> Clase(idClase), OPCIONAL: una tienda puede no estar
  // orientada a ninguna clase en particular
  @ManyToOne({ entity: () => Clase, fieldName: 'idClase', nullable: true })
  clase?: Clase | null;
}
