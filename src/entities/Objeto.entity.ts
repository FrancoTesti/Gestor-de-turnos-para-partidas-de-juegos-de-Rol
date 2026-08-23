import { Entity, OptionalProps, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Inventario } from './Inventario.entity';
import { Tienda } from './Tienda.entity';

@Entity({ tableName: 'objetos' })
export class Objeto {
  [OptionalProps]?: 'idObjeto';

  @PrimaryKey({ type: 'number', autoincrement: true })
  idObjeto!: number;

  @Property({ type: 'number' })
  valor!: number;

  @Property({ type: 'text' })
  descripcion!: string;

  @Property({ type: 'string', length: 100 })
  nombre!: string;

  @Property({ type: 'number' })
  nivelObjeto!: number;

  @Property({ type: 'string', length: 50 })
  tipoObjeto!: string;

  @ManyToOne({ entity: () => Tienda, fieldName: 'idTienda', nullable: true })
  tienda?: Tienda | null;

  @ManyToOne({
    entity: () => Inventario,
    fieldNames: ['idPersonaje', 'numInventario'],
    nullable: true,
  })
  inventario?: Inventario | null;

  @Property({ type: 'number' })
  posicion!: number;
}
