import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Personaje } from './Personaje.entity';

// CP compuesta: (idPersonaje, numInventario). Cada personaje numera sus inventarios.
@Entity({ tableName: 'inventarios' })
export class Inventario {
  @ManyToOne({ entity: () => Personaje, primary: true, fieldName: 'idPersonaje' })
  personaje!: Personaje;

  @PrimaryKey({ type: 'number', autoincrement: false })
  numInventario!: number;

  @Property({ type: 'number' })
  cantidadEspacio!: number;

  [PrimaryKeyProp]?: ['personaje', 'numInventario'];
}
