import 'dotenv/config';
import { EntityCaseNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { Usuario } from './entities/Usuario.entity.js';
import { Jugador } from './entities/Jugador.entity.js';
import { Anfitrion } from './entities/Anfitrion.entity.js';
import { Clase } from './entities/Clase.entity.js';
import { Partida } from './entities/Partida.entity.js';
import { Sesion } from './entities/Sesion.entity.js';
import { Mision } from './entities/Mision.entity.js';
import { Tienda } from './entities/Tienda.entity.js';
import { Personaje } from './entities/Personaje.entity.js';
import { Inventario } from './entities/Inventario.entity.js';
import { PersonajeSesion } from './entities/PersonajeSesion.entity.js';
import { Objeto } from './entities/Objeto.entity.js';

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
  dbName: process.env.DB_NAME ?? 'hola',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  // Columnas con el MISMO nombre que las propiedades (camelCase: nombreUsuario,
  // limiteJugadores...) en vez del snake_case por defecto de MikroORM.
  // Asi la base queda igual al criterio unificado del grupo y a interfaces.ts.
  namingStrategy: EntityCaseNamingStrategy,
  debug: true, // te muestra el SQL que ejecuta -> útil para aprender/debuggear
});
