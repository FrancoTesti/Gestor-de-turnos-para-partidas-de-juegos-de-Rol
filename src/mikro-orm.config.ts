import 'dotenv/config';
import { EntityCaseNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { Usuario } from './entities/Usuario.entity';
import { Jugador } from './entities/Jugador.entity';
import { Anfitrion } from './entities/Anfitrion.entity';
import { Clase } from './entities/Clase.entity';
import { Partida } from './entities/Partida.entity';
import { Sesion } from './entities/Sesion.entity';
import { Mision } from './entities/Mision.entity';
import { Tienda } from './entities/Tienda.entity';
import { Personaje } from './entities/Personaje.entity';
import { Inventario } from './entities/Inventario.entity';
import { PersonajeSesion } from './entities/PersonajeSesion.entity';
import { Objeto } from './entities/Objeto.entity';

/**
 * Supabase exige TLS y su pooler presenta un certificado propio, por eso no se valida la cadena.
 * DB_SSL=false lo desactiva para un Postgres local o de CI, que no tiene SSL.
 */
export const sslDb = process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false };

/**
 * Trabaja en un esquema distinto de public (pruebas, scripts sobre un esquema temporal).
 * Además de `schema`, fija el search_path de cada conexión: em.lock() de MikroORM genera
 * `from "tabla"` sin prefijo de esquema y, sin esto, no encontraría las tablas.
 * El nombre se valida porque se interpola en SQL.
 */
export function enEsquema(schema: string) {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Nombre de esquema inválido');
  return {
    schema,
    pool: {
      min: 0,
      max: 10,
      afterCreate: (conexion: { query: (sql: string, cb: (error: Error | null) => void) => void }, listo: (error: Error | null, conexion: unknown) => void) => {
        conexion.query(`SET search_path TO "${schema}", public`, error => listo(error, conexion));
      },
    },
  };
}

export default defineConfig({
  entities: [
    Usuario,
    Jugador,
    Anfitrion,
    Clase,
    Partida,
    Sesion,
    Mision,
    Tienda,
    Personaje,
    Inventario,
    PersonajeSesion,
    Objeto,
  ],
  // PostgreSQL (Supabase). La URL del Session pooler trae usuario, clave, host, puerto y base.
  clientUrl: process.env.SUPABASE_DB_URL,
  driverOptions: { connection: { ssl: sslDb } },
  pool: { min: 0, max: 10 },
  // Vacío = esquema public (producción). DB_SCHEMA solo lo usan las pruebas y scripts sobre un esquema temporal.
  ...(process.env.DB_SCHEMA ? enEsquema(process.env.DB_SCHEMA) : {}),
  // Columnas con el MISMO nombre que las propiedades (camelCase: nombreUsuario,
  // limiteJugadores...) en vez del snake_case por defecto de MikroORM.
  // Asi la base queda igual al criterio unificado del grupo y a interfaces.ts.
  namingStrategy: EntityCaseNamingStrategy,
  debug: process.env.DB_DEBUG === 'true', // Desactivado por defecto: las consultas pueden contener datos privados.
});
