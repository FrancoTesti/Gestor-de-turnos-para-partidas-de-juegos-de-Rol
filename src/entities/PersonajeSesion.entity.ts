import { Entity, ManyToOne, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Personaje } from './Personaje.entity';
import { Sesion } from './Sesion.entity';

// Tabla de union Personaje <-> Sesion (historial de asistencia).
// CP compuesta: (idPersonaje, idPartida, numSesion) — las dos relaciones juntas.
@Entity({ tableName: 'personaje_sesion' })
export class PersonajeSesion {
  @ManyToOne({ entity: () => Personaje, primary: true, fieldName: 'idPersonaje' })
  personaje!: Personaje;

  // CF compuesta a Sesion(idPartida, numSesion)
  @ManyToOne({
    entity: () => Sesion,
    primary: true,
    fieldNames: ['idPartida', 'numSesion'],
  })
  sesion!: Sesion;

  @Property({ type: 'boolean' })
  dioKarma!: boolean;

  [PrimaryKeyProp]?: ['personaje', 'sesion'];
}
