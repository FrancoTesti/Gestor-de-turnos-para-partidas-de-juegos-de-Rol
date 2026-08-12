// app.ts — Punto de entrada del backend.
// Inicializa MikroORM, arma Express y monta las rutas de la API.
// Uso: npm run dev (recarga sola) o npm start
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { MikroORM, RequestContext } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import { crearUsuarioRouter } from './routes/usuario.routes';

// En CommonJS no se puede usar await en el nivel superior, asi que todo
// el arranque va dentro de una funcion async.
async function main() {
  const orm = await MikroORM.init(config);

  const app = express();

  // Parsea el body JSON de los POST/PUT
  app.use(express.json());

  // Cada request trabaja con su propia copia (fork) del EntityManager.
  // Es el patron obligatorio de MikroORM para que dos requests en paralelo
  // no se pisen las entidades cargadas.
  app.use((req, res, next) => RequestContext.create(orm.em, next));

  // Rutas de la API (a medida que hagan mas CRUDs, se montan aca)
  app.use('/api/usuarios', crearUsuarioRouter(orm.em));

  // Cualquier URL que no matchee ninguna ruta -> 404 en JSON
  app.use((req, res) => {
    res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}` });
  });

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
    console.log(`Prueba: GET http://localhost:${port}/api/usuarios`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
