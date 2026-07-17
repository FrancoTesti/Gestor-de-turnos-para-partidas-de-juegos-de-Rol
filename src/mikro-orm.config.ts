import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { Usuario } from './entities/Usuario.entity.js';
import { Jugador } from './entities/Jugador.entity.js';
import { Anfitrion } from './entities/Anfitrion.entity.js';

export default defineConfig({
  entities: [Usuario, Jugador, Anfitrion],
  dbName: process.env.DB_NAME ?? 'hola',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  debug: true, // te muestra el SQL que ejecuta -> útil para aprender/debuggear
});