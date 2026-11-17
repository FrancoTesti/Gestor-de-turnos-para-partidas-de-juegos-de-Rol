// Activa Row Level Security en todas las tablas del esquema public, sin crear políticas.
// Supabase expone public por su API REST con la clave "publishable": sin RLS, cualquiera con esa clave
// podría leer tablas como usuarios (hashes de contraseña). El backend se conecta como dueño de las
// tablas (rol postgres), que ignora RLS, así que no se ve afectado. Es idempotente.
// Uso: npm run db:rls   (lee SUPABASE_DB_URL de .env; nunca imprime la URL)
import 'dotenv/config';
import pg from 'pg';

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('Falta SUPABASE_DB_URL en .env.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

try {
  await client.connect();
  const { rows } = await client.query(
    "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' order by 1",
  );
  if (!rows.length) {
    console.log('No hay tablas en public. Ejecutá antes: npm run schema:create');
  }
  for (const { relname } of rows) {
    // El nombre sale del catálogo de Postgres; se cita igualmente como identificador.
    await client.query(`alter table public."${relname.replaceAll('"', '""')}" enable row level security`);
  }
  const estado = await client.query(
    "select count(*) filter (where c.relrowsecurity)::int as con_rls, count(*)::int as total from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r'",
  );
  const { con_rls: conRls, total } = estado.rows[0];
  console.log(`Tablas con RLS: ${conRls} de ${total}`);
  if (conRls !== total) process.exitCode = 1;
} catch (error) {
  console.error('FALLO:', error.code ?? '', String(error.message).split(new URL(url).password || '\0').join('***'));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
