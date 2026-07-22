import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Anfitrion } from './Anfitrion.entity.js';

@Entity({ tableName: 'partidas' })
export class Partida {
  @PrimaryKey({ type: 'number' })
  idPartida!: number;

  @Property({ type: 'string', length: 100 })
  nombre!: string;

  // true = activa, false = finalizada
  @Property({ type: 'boolean' })
  estado!: boolean;

  @Property({ type: 'number' })
  limiteJugadores!: number;

  // Vacia ("") si la partida es publica
  @Property({ type: 'string', length: 100 })
  contrasena!: string;

  // CF(idUsuarioAnfitrion) -> Anfitrion(idUsuario) NN
  @ManyToOne({ entity: () => Anfitrion, fieldName: 'idUsuarioAnfitrion' })
  anfitrion!: Anfitrion;
}
