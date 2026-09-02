// app.ts — Punto de entrada del backend.
// Inicializa MikroORM, arma Express y monta las rutas de la API.
import 'reflect-metadata';
import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
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
import { createAuth } from './security/auth';
import { authorizeCrud, HttpError } from './security/authorization';
import { crearJuegoRouter } from './routes/juego.routes';
import { ZodError } from 'zod';
import { ForeignKeyConstraintViolationException, UniqueConstraintViolationException } from '@mikro-orm/core';

export function createApp(orm: MikroORM) {
  const app = express();

  // Middleware CORS para permitir peticiones desde el frontend
  const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Cache-Control', 'no-store');
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
  app.use(express.json({ limit: '64kb' }));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && req.headers.origin !== allowedOrigin) {
      res.status(403).json({ message: 'Origen no permitido' }); return;
    }
    next();
  });

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
  const auth = createAuth(orm.em);
  app.use('/api/auth', auth.router);
  app.use('/api', auth.requireAuth, authorizeCrud(orm.em), crearJuegoRouter(orm.em));
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

  const errors: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) { res.status(err.status).json({ message: err.message }); return; }
    if (err instanceof ZodError) { res.status(400).json({ message: err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }); return; }
    if (err instanceof UniqueConstraintViolationException) { res.status(409).json({ message: 'Ese registro ya existe' }); return; }
    if (err instanceof ForeignKeyConstraintViolationException) { res.status(409).json({ message: 'El registro tiene datos relacionados; eliminarlos primero' }); return; }
    if (err instanceof SyntaxError) { res.status(400).json({ message: 'JSON inválido' }); return; }
    console.error(err);
    res.status(500).json({ message: 'No se pudo completar la operación' });
  };
  app.use(errors);
  return app;
}

async function main() {
  const orm = await MikroORM.init(config);
  const app = createApp(orm);

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
    console.log(`Jugadores: GET http://localhost:${port}/api/jugadores`);
    console.log(`Anfitriones: GET http://localhost:${port}/api/anfitriones`);
    console.log(`Partidas: GET http://localhost:${port}/api/partidas`);
    console.log(`Personajes: GET http://localhost:${port}/api/personajes`);
  });
}

if (require.main === module) main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
