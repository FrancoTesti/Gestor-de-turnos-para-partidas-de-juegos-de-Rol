// Prueba de conexión a Supabase/PostgreSQL. Solo lectura + un esquema temporal que se revierte.
// Uso: node scripts/probar-conexion-supabase.mjs   (lee SUPABASE_DB_URL de .env)
// Nunca imprime la URL completa ni la contraseña.
import 'dotenv/config';
import pg from 'pg';

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('Falta SUPABASE_DB_URL en .env (postgresql://usuario:clave@host:puerto/postgres).');
  process.exit(1);
}

let destino;
try {
  const u = new URL(url);
  destino = `${u.username}@${u.hostname}:${u.port || 5432}${u.pathname}`;
} catch {
  console.error('SUPABASE_DB_URL no es una URL válida. Si la clave tiene @ : / # ? %, hay que codificarla (encodeURIComponent).');
  process.exit(1);
}

const redactar = texto => String(texto).split(new URL(url).password || '\0').join('***');
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10_000 });

try {
  await client.connect();
  console.log(`Conectado a ${destino}`);
  const info = await client.query('select version() as version, current_user as usuario, current_database() as base');
  console.log('Versión:', info.rows[0].version.split(',')[0]);
  console.log('Usuario / base:', info.rows[0].usuario, '/', info.rows[0].base);

  // ¿Puede crear esquemas y tablas, y bloquear filas? Todo dentro de una transacción que se revierte.
  await client.query('begin');
  await client.query('create schema qa_prueba_conexion');
  await client.query('create table qa_prueba_conexion.t (id serial primary key, n int not null)');
  await client.query('insert into qa_prueba_conexion.t (n) values (1)');
  const lock = await client.query('select * from qa_prueba_conexion.t for update');
  console.log(`Crear esquema/tabla y SELECT ... FOR UPDATE: OK (${lock.rowCount} fila)`);
  await client.query('rollback');

  const tablas = await client.query("select count(*)::int as n from information_schema.tables where table_schema = 'public'");
  console.log(`Tablas existentes en public: ${tablas.rows[0].n}`);
  console.log('RESULTADO: conexión válida.');
} catch (error) {
  try { await client.query('rollback'); } catch { /* sin transacción abierta */ }
  console.error('FALLO:', redactar(error.code ?? ''), redactar(error.message));
  if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
    console.error('Pista: la conexión directa de Supabase es solo IPv6. Usá la cadena del "Session pooler" (puerto 5432).');
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
