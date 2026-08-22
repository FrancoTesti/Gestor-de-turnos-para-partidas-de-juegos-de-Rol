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
        '/api/usuarios',
        '/api/clases',
        '/api/objetos',
        '/api/tiendas',
      ],
    });
  });

  // Rutas de la API
  app.use('/api/usuarios', crearUsuarioRouter(orm.em));
  app.use('/api/clases', crearClaseRouter(orm.em));
  app.use('/api/objetos', crearObjetoRouter(orm.em));
  app.use('/api/tiendas', crearTiendaRouter(orm.em));

  // Cualquier URL que no matchee ninguna ruta -> 404 en JSON
  app.use((req, res) => {
    res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}` });
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
    console.log(`Salud: http://localhost:${port}/api/health`);
    console.log(`Usuarios: GET http://localhost:${port}/api/usuarios`);
    console.log(`Clases: GET http://localhost:${port}/api/clases`);
    console.log(`Objetos: GET http://localhost:${port}/api/objetos`);
    console.log(`Tiendas: GET http://localhost:${port}/api/tiendas`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
