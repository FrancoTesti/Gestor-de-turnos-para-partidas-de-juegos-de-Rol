require('dotenv/config');
require('reflect-metadata');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { Client } = require('pg');
const { MikroORM } = require('@mikro-orm/postgresql');
const { createApp } = require('../dist/app');
const { default: config, enEsquema, sslDb } = require('../dist/mikro-orm.config');

module.exports = async function setup() {
  const dbUrl = process.env.TEST_DB_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) throw new Error('Indicá TEST_DB_URL o SUPABASE_DB_URL para habilitar las pruebas E2E con PostgreSQL.');
  // Esquema único por ejecución dentro de la base de TEST_DB_URL; nunca se toca public.
  const schema = `rpg_e2e_${randomBytes(12).toString('hex')}`;
  let connection, orm, server, vite, created = false;
  const previousOrigin = process.env.CORS_ORIGIN;
  const cleanup = async () => {
    try {
      if (vite) await vite.close();
    } finally {
      try {
        if (server?.listening) await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            server.closeAllConnections();
            resolve();
          }, 2_000);
          timeout.unref();
          server.close(error => {
            clearTimeout(timeout);
            error ? reject(error) : resolve();
          });
          server.closeAllConnections();
        });
      } finally {
        try {
          if (orm) await orm.close(true);
        } finally {
          try {
            // Solo se borra el esquema aleatorio que esta ejecución creó; nunca public.
            if (created && /^rpg_e2e_[a-f0-9]{24}$/.test(schema)) await connection.query(`DROP SCHEMA "${schema}" CASCADE`);
          } finally {
            if (connection) await connection.end();
            if (previousOrigin === undefined) delete process.env.CORS_ORIGIN;
            else process.env.CORS_ORIGIN = previousOrigin;
          }
        }
      }
    }
  };
  try {
    connection = new Client({ connectionString: dbUrl, ssl: sslDb });
    await connection.connect();
    await connection.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    orm = await MikroORM.init({ ...config, clientUrl: dbUrl, ...enEsquema(schema), debug: false });
    await orm.schema.createSchema();
    process.env.CORS_ORIGIN = 'http://127.0.0.1:5174';
    server = createApp(orm).listen(3101, '127.0.0.1');
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    const viteModule = path.resolve(__dirname, '../frontend/node_modules/vite/dist/node/index.js');
    const { createServer } = await import(pathToFileURL(viteModule).href);
    vite = await createServer({
      root: path.resolve(__dirname, '../frontend'),
      logLevel: 'error',
      server: {
        host: '127.0.0.1',
        port: 5174,
        strictPort: true,
        proxy: { '/api': { target: 'http://127.0.0.1:3101' } },
      },
    });
    await vite.listen();
    return cleanup;
  } catch (error) {
    await cleanup();
    throw error;
  }
};
