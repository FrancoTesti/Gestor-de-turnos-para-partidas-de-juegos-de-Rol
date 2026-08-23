// Muestra el SQL que MikroORM generaria para crear TODAS las tablas,
// sin conectarse ni tocar la base. Uso: npm run schema:dump
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import config from './mikro-orm.config';

async function main() {
  const orm = await MikroORM.init({ ...config, connect: false, debug: false });
  const sql = await orm.schema.getCreateSchemaSQL();
  console.log(sql);
  await orm.close(true);
}

main();
