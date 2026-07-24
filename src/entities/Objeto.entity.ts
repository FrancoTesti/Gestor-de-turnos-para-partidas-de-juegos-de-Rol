import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Inventario } from './Inventario.entity.js';
import { Tienda } from './Tienda.entity.js';

@Entity({ tableName: 'objetos' })
export class Objeto {
  @PrimaryKey({ type: 'number' })
  idObjeto!: number;

  @Property({ type: 'number' })
  valor!: number;

  @Property({ type: 'text' })
  descripcion!: string;

  @Property({ type: 'string', length: 100 })
  nombre!: string;

  @Property({ type: 'number' })
  nivelObjeto!: number;

  // "armadura" | "espada" | "escudo" | "consumible" | ...
  @Property({ type: 'string', length: 50 })
  tipoObjeto!: string;

  // Un objeto esta EN LA TIENDA o EN UN INVENTARIO (o en ninguno) -> ambas CF opcionales
  @ManyToOne({ entity: () => Tienda, fieldName: 'idTienda', nullable: true })
  tienda?: Tienda | null;

  // CF compuesta a Inventario(idPersonaje, numInventario), opcional
  @ManyToOne({
    entity: () => Inventario,
    fieldNames: ['idPersonaje', 'numInventario'],
    nullable: true,
  })
  inventario?: Inventario | null;

  @Property({ type: 'number' })
  posicion!: number;
}
