import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import config from '../mikro-orm.config';
import { Usuario } from '../entities/Usuario.entity';
import { Partida } from '../entities/Partida.entity';
import { hashPassword, isPasswordHash } from '../security/password';

async function main() {
  const orm = await MikroORM.init({ ...config, debug: false });
  try {
    const em = orm.em.fork();
    const users = await em.find(Usuario, {});
    const pending = users.filter(u => !isPasswordHash(u.contrasena));
    const games = await em.find(Partida, {});
    const pendingGames = games.filter(p => p.contrasena && !isPasswordHash(p.contrasena));
    console.log(`${pending.length} usuarios y ${pendingGames.length} partidas requieren migración. Base: ${config.dbName}`);
    if (!process.argv.includes('--apply')) { console.log('Modo diagnóstico. Hacé backup y ejecutá con --apply para migrar.'); return; }
    await em.transactional(async tx => {
      const current = await tx.find(Usuario, {});
      for (const u of current) if (!isPasswordHash(u.contrasena)) u.contrasena = await hashPassword(u.contrasena);
      const currentGames = await tx.find(Partida, {});
      for (const p of currentGames) if (p.contrasena && !isPasswordHash(p.contrasena)) p.contrasena = await hashPassword(p.contrasena);
      await tx.flush();
    });
    console.log('Migración terminada. No se imprimieron contraseñas.');
  } finally { await orm.close(true); }
}
main().catch(() => { console.error('No se pudo migrar. Revisá la conexión y los permisos.'); process.exitCode = 1; });
