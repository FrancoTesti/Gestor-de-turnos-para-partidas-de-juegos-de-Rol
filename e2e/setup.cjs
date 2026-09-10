require('reflect-metadata');
const { randomBytes } = require('node:crypto');
const { createConnection } = require('mysql2/promise');
const { MikroORM } = require('@mikro-orm/mysql');
const { createApp } = require('../dist/app');
const config = require('../dist/mikro-orm.config').default;

module.exports = async function setup() {
  if (!process.env.TEST_DB_PORT) throw new Error('Indicá TEST_DB_PORT para habilitar las pruebas E2E con MySQL.');
  const database = `rpg_e2e_${randomBytes(12).toString('hex')}`;
  const settings = {
    host: process.env.TEST_DB_HOST ?? '127.0.0.1',
    port: Number(process.env.TEST_DB_PORT),
    user: process.env.TEST_DB_USER ?? 'root',
    password: process.env.TEST_DB_PASSWORD ?? '',
  };
  let connection, orm, server, created = false;
  const previousOrigin = process.env.CORS_ORIGIN;
  const cleanup = async () => {
    try {
      if (server?.listening) await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    } finally {
      try {
        if (orm) await orm.close(true);
      } finally {
        try {
          // Solo se borra la base aleatoria que esta ejecución creó; nunca DB_NAME.
          if (created && /^rpg_e2e_[a-f0-9]{24}$/.test(database)) await connection.query(`DROP DATABASE \`${database}\``);
        } finally {
          if (connection) await connection.end();
          if (previousOrigin === undefined) delete process.env.CORS_ORIGIN;
          else process.env.CORS_ORIGIN = previousOrigin;
        }
      }
    }
  };
  try {
    connection = await createConnection(settings);
    await connection.query(`CREATE DATABASE \`${database}\``);
    created = true;
    orm = await MikroORM.init({ ...config, ...settings, dbName: database, debug: false });
    await orm.schema.createSchema();
    process.env.CORS_ORIGIN = 'http://127.0.0.1:5174';
    server = createApp(orm).listen(3101, '127.0.0.1');
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    return cleanup;
  } catch (error) {
    await cleanup();
    throw error;
  }
};
