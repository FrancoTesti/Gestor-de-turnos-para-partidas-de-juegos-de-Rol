// app.ts — Punto de entrada del backend.
// Inicializa MikroORM, arma Express y monta las rutas de la API.
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import { crearUsuarioRouter } from './routes/usuario.routes';
import { crearClaseRouter } from './routes/clase.routes';
import { crearObjetoRouter } from './routes/objeto.routes';
import { crearTiendaRouter } from './routes/tienda.routes';
import { crearJugadorRouter } from './routes/jugador.routes';
import { crearAnfitrionRouter } from './routes/anfitrion.routes';
import { crearPartidaRouter } from './routes/partida.routes';
import { crearPersonajeRouter } from './routes/personaje.routes';

async function main() {
  const orm = await MikroORM.init(config);

  const app = express();

  // Middleware CORS para permitir peticiones desde el frontend
  const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Parsea el body JSON de los POST/PUT
  app.use(express.json());

  // Cada request trabaja con su propia copia (fork) del EntityManager.
  app.use((req, res, next) => RequestContext.create(orm.em, next));

  // Rutas de estado
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'API del Gestor de Turnos para Juegos de Rol funcionando correctamente',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/usuarios', '/api/clases', '/api/objetos', '/api/tiendas',
        '/api/jugadores', '/api/anfitriones', '/api/partidas', '/api/personajes',
      ],
    });
  });

  // Rutas de la API
  app.use('/api/usuarios', crearUsuarioRouter(orm.em));
  app.use('/api/clases', crearClaseRouter(orm.em));
  app.use('/api/objetos', crearObjetoRouter(orm.em));
  app.use('/api/tiendas', crearTiendaRouter(orm.em));
  app.use('/api/jugadores', crearJugadorRouter(orm.em));
  app.use('/api/anfitriones', crearAnfitrionRouter(orm.em));
  app.use('/api/partidas', crearPartidaRouter(orm.em));
  app.use('/api/personajes', crearPersonajeRouter(orm.em));

  // 404
  app.use((req, res) => {
    res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}` });
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
    console.log(`Jugadores: GET http://localhost:${port}/api/jugadores`);
    console.log(`Anfitriones: GET http://localhost:${port}/api/anfitriones`);
    console.log(`Partidas: GET http://localhost:${port}/api/partidas`);
    console.log(`Personajes: GET http://localhost:${port}/api/personajes`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
