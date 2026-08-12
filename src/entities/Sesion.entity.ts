import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Partida } from './Partida.entity';

// CP compuesta: (idPartida, numSesion). La partida es parte de la clave.
@Entity({ tableName: 'sesiones' })
export class Sesion {
  @ManyToOne({ entity: () => Partida, primary: true, fieldName: 'idPartida' })
  partida!: Partida;

  // La asigna la app (sesion 1, 2, 3... dentro de cada partida), no es autoincrement
  @PrimaryKey({ type: 'number', autoincrement: false })
  numSesion!: number;

  @Property({ type: 'number' })
  duracionSesion!: number;

  @Property({ type: 'number' })
  cantJugadores!: number;

  // 1 = en curso, 2 = finalizada
  @Property({ type: 'number' })
  estadoSesion!: number;

  [PrimaryKeyProp]?: ['partida', 'numSesion'];
}
