import { Entity, ManyToOne, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Sesion } from './Sesion.entity';

// CP compuesta: (idPartida, numSesion, numMision).
// La CF a Sesion es compuesta -> se mapea con fieldNames (las dos columnas).
@Entity({ tableName: 'misiones' })
export class Mision {
  @ManyToOne({
    entity: () => Sesion,
    primary: true,
    fieldNames: ['idPartida', 'numSesion'],
  })
  sesion!: Sesion;

  // La asigna la app (mision 1, 2, 3... dentro de cada sesion)
  @PrimaryKey({ type: 'number', autoincrement: false })
  numMision!: number;

  @Property({ type: 'text' })
  descripcion!: string;

  @Property({ type: 'number' })
  dineroTotal!: number;

  @Property({ type: 'number' })
  xpTotal!: number;

  @Property({ type: 'number' })
  xpOtorgadoJugadores!: number;

  @Property({ type: 'number' })
  dineroOtorgadoAJugadores!: number;

  @Property({ type: 'number' })
  asistenciaGrupoGrande!: number;

  // true = completada, false = pendiente
  @Property({ type: 'boolean' })
  estado!: boolean;

  [PrimaryKeyProp]?: ['sesion', 'numMision'];
}
