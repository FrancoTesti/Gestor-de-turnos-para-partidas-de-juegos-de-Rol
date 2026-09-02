import 'reflect-metadata';
import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createConnection, type Connection } from 'mysql2/promise';
import { MikroORM } from '@mikro-orm/mysql';
import type { Server } from 'node:http';
import config from '../mikro-orm.config';
import { createApp } from '../app';
import { Usuario } from '../entities/Usuario.entity';
import { Jugador } from '../entities/Jugador.entity';
import { Anfitrion } from '../entities/Anfitrion.entity';
import { Clase } from '../entities/Clase.entity';
import { Partida } from '../entities/Partida.entity';
import { Personaje } from '../entities/Personaje.entity';
import { Inventario } from '../entities/Inventario.entity';
import { Objeto } from '../entities/Objeto.entity';
import { Tienda } from '../entities/Tienda.entity';
import { ObjetoService } from '../services/objeto.service';
import { hashPassword, verifyPassword } from '../security/password';

// Nunca usa DB_NAME ni borra una base existente: crea una base única por ejecución.
const database = `rpg_test_${randomBytes(12).toString('hex')}`;
let connection: Connection;
let orm: MikroORM;
let server: Server;
let base: string;
let created = false;
let hostCookie: string;
let playerCookie: string;
let otherCookie: string;
let ids: { host: number; player: number; other: number; game: number; character: number; otherCharacter: number; object: number; store: number; class: number };
async function request(path: string, method = 'GET', body?: unknown, cookie = hostCookie) {
  const res = await fetch(`${base}/api${path}`, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined, cookie: res.headers.get('set-cookie')?.split(';')[0] ?? '' };
}
before(async () => {
  assert.ok(process.env.TEST_DB_PORT, 'Indicá TEST_DB_PORT para habilitar explícitamente las pruebas MySQL');
  const settings = { host: process.env.TEST_DB_HOST ?? '127.0.0.1', port: Number(process.env.TEST_DB_PORT), user: process.env.TEST_DB_USER ?? 'root', password: process.env.TEST_DB_PASSWORD ?? '' };
  connection = await createConnection(settings);
  await connection.query(`CREATE DATABASE \`${database}\``); created = true;
  orm = await MikroORM.init({ ...config, ...settings, dbName: database, debug: false });
  await orm.schema.createSchema();
  server = createApp(orm).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve()));
  if (orm) await orm.close(true);
  if (connection) {
    if (created && /^rpg_test_[a-f0-9]{24}$/.test(database)) await connection.query(`DROP DATABASE \`${database}\``);
    await connection.end();
  }
});
beforeEach(async () => {
  await orm.schema.clearDatabase();
  const em = orm.em.fork();
  const password = await hashPassword('secreto123');
  const h = em.create(Usuario, { nombreUsuario: 'Anfitrión', nickname: 'host', contrasena: password, imagen: '' });
  const u = em.create(Usuario, { nombreUsuario: 'Jugador', nickname: 'player', contrasena: password, imagen: '' });
  const o = em.create(Usuario, { nombreUsuario: 'Otro jugador', nickname: 'other', contrasena: password, imagen: '' });
  const host = em.create(Anfitrion, { usuario: h, karma: 0, cantPartidasActuales: 0 });
  const player = em.create(Jugador, { usuario: u, estado: true });
  const other = em.create(Jugador, { usuario: o, estado: true });
  const clase = em.create(Clase, { nombreClase: 'Guerrero', descripcionClase: 'Combate' });
  const partida = em.create(Partida, { idPartida: undefined!, nombre: 'Campaña', estado: true, limiteJugadores: 4, contrasena: '', anfitrion: host });
  const p = em.create(Personaje, { nombreFicticio: 'Arthur', raza: 'Humano', xp: 0, nivel: 1, dinero: 100, clase, jugador: player, partida });
  const q = em.create(Personaje, { nombreFicticio: 'Merlín', raza: 'Humano', xp: 0, nivel: 1, dinero: 100, clase, jugador: other, partida });
  em.create(Inventario, { personaje: p, numInventario: 1, cantidadEspacio: 2 });
  em.create(Inventario, { personaje: q, numInventario: 1, cantidadEspacio: 2 });
  const tienda = em.create(Tienda, { nombre: 'Armería', claseTienda: 'Armas', clase });
  const objeto = em.create(Objeto, { nombre: 'Espada', descripcion: 'Hierro', tipoObjeto: 'Arma', valor: 40, nivelObjeto: 1, posicion: 0, tienda, inventario: null });
  await em.flush();
  ids = { host: h.idUsuario, player: u.idUsuario, other: o.idUsuario, game: partida.idPartida, character: p.idPersonaje, otherCharacter: q.idPersonaje, object: objeto.idObjeto, store: tienda.idTienda, class: clase.idClase };
  // Una app nueva por fixture evita que el rate limiter y las sesiones contaminen otros tests.
  await new Promise<void>(resolve => server.close(() => resolve()));
  server = createApp(orm).listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address(); assert.ok(address && typeof address !== 'string'); base = `http://127.0.0.1:${address.port}`;
  hostCookie = (await request('/auth/login', 'POST', { nickname: 'host', contrasena: 'secreto123' }, '')).cookie;
  playerCookie = (await request('/auth/login', 'POST', { nickname: 'player', contrasena: 'secreto123' }, '')).cookie;
  otherCookie = (await request('/auth/login', 'POST', { nickname: 'other', contrasena: 'secreto123' }, '')).cookie;
  assert.ok(hostCookie && playerCookie && otherCookie, 'Login de fixtures');
});

test('registro persistente, hash, perfil atómico y nickname duplicado', async () => {
  const data = { nombreUsuario: 'Nuevo', nickname: 'nuevo', contrasena: 'password123', tipo: 'jugador' };
  const result = await request('/auth/register', 'POST', data, ''); assert.equal(result.status, 201);
  assert.equal(result.body.contrasena, undefined);
  const em = orm.em.fork(); const user = await em.findOneOrFail(Usuario, { nickname: 'nuevo' });
  assert.notEqual(user.contrasena, data.contrasena); assert.ok(await verifyPassword(data.contrasena, user.contrasena));
  assert.ok(await em.findOne(Jugador, { usuario: user }));
  assert.equal((await request('/auth/register', 'POST', data, '')).status, 409);
  assert.equal(await em.count(Usuario, { nickname: 'nuevo' }), 1);
});
test('API exige sesión, protege cuentas ajenas y rechaza credenciales incorrectas', async () => {
  assert.equal((await request('/usuarios', 'GET', undefined, '')).status, 401);
  assert.equal((await request(`/usuarios/${ids.other}`, 'PUT', { nickname: 'tomado' }, playerCookie)).status, 403);
  assert.equal((await request('/auth/login', 'POST', { nickname: 'player', contrasena: 'incorrecta' }, '')).status, 401);
  assert.equal((await request('/auth/me', 'GET', undefined, playerCookie)).body.usuario.idUsuario, ids.player);
  assert.equal((await request(`/usuarios/${ids.player}`, 'PUT', { contrasena: 'nueva123' }, playerCookie)).status, 200);
  assert.equal((await request('/auth/me', 'GET', undefined, playerCookie)).status, 401);
});
test('una cuenta sin partidas ni personajes puede borrarse junto con su perfil', async () => {
  await request('/auth/register', 'POST', { nombreUsuario: 'Nuevo', nickname: 'nuevo', contrasena: 'password123', tipo: 'jugador' }, '');
  const login = await request('/auth/login', 'POST', { nickname: 'nuevo', contrasena: 'password123' }, '');
  assert.equal((await request(`/usuarios/${login.body.usuario.idUsuario}`, 'DELETE', undefined, login.cookie)).status, 204);
  assert.equal((await request('/auth/me', 'GET', undefined, login.cookie)).status, 401);
});
test('CRUD de catálogo y referencias inexistentes', async () => {
  const c = await request('/clases', 'POST', { nombreClase: 'Mago', descripcionClase: 'Magia' }); assert.equal(c.status, 201);
  const t = await request('/tiendas', 'POST', { nombre: 'Magia', claseTienda: 'Magia', idClase: c.body.idClase }); assert.equal(t.status, 201);
  assert.equal((await request(`/tiendas/${t.body.idTienda}`, 'PUT', { nombre: 'Nueva tienda' })).status, 200);
  assert.equal((await request('/tiendas', 'POST', { nombre: 'Inválida', claseTienda: 'Magia', idClase: 99999 })).status, 400);
  assert.equal((await request('/objetos', 'POST', { nombre: 'Cosa', descripcion: 'Cosa', tipoObjeto: 'Arma', valor: 4, nivelObjeto: 1, idTienda: 99999 })).status, 400);
  assert.equal((await request('/clases', 'POST', { nombreClase: 'Trampa', descripcionClase: 'No' }, playerCookie)).status, 403);
  assert.equal((await request(`/tiendas/${t.body.idTienda}`, 'DELETE')).status, 204);
  assert.equal((await request(`/clases/${c.body.idClase}`, 'DELETE')).status, 204);
});
test('cambio público/privado, contraseña, cupo y anfitrión propietario', async () => {
  const path = `/partidas/${ids.game}`;
  assert.equal((await request(path, 'PUT', { esPrivada: true })).status, 400);
  assert.equal((await request(path, 'PUT', { esPrivada: true, contrasena: 'clave123' })).body.esPrivada, true);
  assert.equal((await request(path, 'PUT', { esPrivada: false, contrasena: 'otra' })).status, 400);
  assert.equal((await request(path, 'PUT', { esPrivada: false })).body.esPrivada, false);
  assert.equal((await request(path, 'PUT', { limiteJugadores: 1 })).status, 400);
  assert.equal((await request(path, 'PUT', { nombre: 'Secuestrada' }, playerCookie)).status, 403);
});
test('creación de personaje privado crea inventario y no permite dinero elegido por cliente', async () => {
  const game = await request('/partidas', 'POST', { nombre: 'Privada', estado: 'activa', limiteJugadores: 2, esPrivada: true, contrasena: 'clave123', idUsuarioAnfitrion: ids.host });
  const data = { nombreFicticio: 'Nuevo', raza: 'Elfo', idClase: ids.class, idPartida: game.body.idPartida, idUsuarioJugador: ids.player, dinero: 99999 };
  assert.equal((await request('/personajes', 'POST', data, playerCookie)).status, 400);
  const p = await request('/personajes', 'POST', { ...data, contrasenaPartida: 'clave123' }, playerCookie);
  assert.equal(p.status, 201); assert.equal(p.body.dinero, 100);
  assert.equal((await request(`/inventarios/${p.body.idPersonaje}/1`, 'GET', undefined, playerCookie)).body.cantidadEspacio, 10);
  assert.equal((await request(`/personajes/${p.body.idPersonaje}`, 'PUT', { dinero: 999 }, playerCookie)).status, 403);
});
test('compra valida enteros estrictos, posición, propiedad y dinero', async () => {
  const path = `/objetos/${ids.object}/comprar`;
  assert.equal((await request(path, 'POST', { idPersonaje: true, numInventario: true, posicion: null }, playerCookie)).status, 400);
  assert.equal((await request(path, 'POST', { idPersonaje: ids.character, numInventario: 1, posicion: 999 }, playerCookie)).status, 400);
  assert.equal((await request(path, 'POST', { idPersonaje: ids.otherCharacter, numInventario: 1, posicion: 0 }, playerCookie)).status, 403);
  const buy = await request(path, 'POST', { idPersonaje: ids.character, numInventario: 1, posicion: 0 }, playerCookie);
  assert.equal(buy.status, 200); assert.equal(buy.body.dineroRestante, 60);
  assert.equal((await request(path, 'POST', { idPersonaje: ids.character, numInventario: 1, posicion: 1 }, playerCookie)).status, 409);
  const p = await orm.em.fork().findOneOrFail(Personaje, { idPersonaje: ids.character }); assert.equal(p.dinero, 60);
});
test('rollback real: falla tras escribir en MySQL y recupera dinero y ubicación', async () => {
  const em = orm.em.fork({ freshEventManager: true });
  em.getEventManager().registerSubscriber({ afterFlush() { throw new Error('Fallo después de escribir'); } });
  await assert.rejects(new ObjetoService(em).comprarObjeto(ids.object, { idPersonaje: ids.character, numInventario: 1, posicion: 0 }), /Fallo después de escribir/);
  const fresh = orm.em.fork();
  assert.equal((await fresh.findOneOrFail(Personaje, { idPersonaje: ids.character })).dinero, 100);
  const object = await fresh.findOneOrFail(Objeto, { idObjeto: ids.object });
  assert.equal(object.tienda?.idTienda, ids.store); assert.equal(object.inventario, null);
});
test('dos compras concurrentes del mismo objeto: solo una gana y solo un débito', async () => {
  const results = await Promise.all([
    request(`/objetos/${ids.object}/comprar`, 'POST', { idPersonaje: ids.character, numInventario: 1, posicion: 0 }, playerCookie),
    request(`/objetos/${ids.object}/comprar`, 'POST', { idPersonaje: ids.otherCharacter, numInventario: 1, posicion: 0 }, otherCookie),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const players = await orm.em.fork().find(Personaje, {}); assert.equal(players.reduce((sum, p) => sum + p.dinero, 0), 160);
});
test('dos compras concurrentes a igual posición no duplican ni descuentan dos veces', async () => {
  const em = orm.em.fork(); const tienda = await em.findOneOrFail(Tienda, { idTienda: ids.store }); const o = em.create(Objeto, { nombre: 'Escudo', descripcion: 'Hierro', tipoObjeto: 'Arma', valor: 40, nivelObjeto: 1, posicion: 0, tienda }); await em.flush();
  const data = { idPersonaje: ids.character, numInventario: 1, posicion: 0 };
  const results = await Promise.all([request(`/objetos/${ids.object}/comprar`, 'POST', data, playerCookie), request(`/objetos/${o.idObjeto}/comprar`, 'POST', data, playerCookie)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal((await orm.em.fork().findOneOrFail(Personaje, { idPersonaje: ids.character })).dinero, 60);
});
test('venta entre 70 y 100 %, no repetible, con control de propiedad', async () => {
  await request(`/objetos/${ids.object}/comprar`, 'POST', { idPersonaje: ids.character, numInventario: 1, posicion: 0 }, playerCookie);
  const path = `/objetos/${ids.object}/vender`; const data = { idPersonaje: ids.character, idTienda: ids.store, precio: 28 };
  assert.equal((await request(path, 'POST', { ...data, precio: 27 }, playerCookie)).status, 409);
  assert.equal((await request(path, 'POST', { ...data, precio: 41 }, playerCookie)).status, 409);
  assert.equal((await request(path, 'POST', data, otherCookie)).status, 403);
  const sale = await request(path, 'POST', data, playerCookie); assert.equal(sale.status, 200); assert.equal(sale.body.dineroRestante, 88);
  assert.equal((await request(path, 'POST', data, playerCookie)).status, 409);
});
test('inventarios CRUD: movimiento, rango, reducción, eliminación vacía', async () => {
  const listado = await request('/inventarios', 'GET', undefined, playerCookie);
  assert.equal(listado.status, 200); assert.equal(listado.body.length, 1); assert.equal(listado.body[0].idPersonaje, ids.character);
  assert.equal((await request(`/objetos/sugeridos/${ids.character}`, 'GET', undefined, playerCookie)).body[0].idObjeto, ids.object);
  const path = `/inventarios/${ids.character}/2`;
  assert.equal((await request('/inventarios', 'POST', { idPersonaje: ids.character, numInventario: 2, cantidadEspacio: 4 }, playerCookie)).status, 201);
  await request(`/objetos/${ids.object}/comprar`, 'POST', { idPersonaje: ids.character, numInventario: 1, posicion: 0 }, playerCookie);
  assert.equal((await request(`${path}/mover`, 'POST', { idObjeto: ids.object, posicion: 3 }, playerCookie)).status, 200);
  assert.equal((await request(path, 'PUT', { cantidadEspacio: 3 }, playerCookie)).status, 409);
  assert.equal((await request(path, 'DELETE', undefined, playerCookie)).status, 409);
  assert.equal((await request(`/inventarios/${ids.character}/1`, 'DELETE', undefined, playerCookie)).status, 204);
});
test('sesión, misión, recompensas una sola vez, cierre y karma una sola vez', async () => {
  const session = `/sesiones/${ids.game}/1`;
  assert.equal((await request('/sesiones', 'POST', { idPartida: ids.game, numSesion: 1, duracionSesion: 60 })).status, 201);
  assert.equal((await request(session, 'PUT', { duracionSesion: 90 })).status, 200);
  assert.equal((await request('/misiones', 'POST', { idPartida: ids.game, numSesion: 1, numMision: 1, descripcion: 'Rescate', dineroTotal: 10, xpTotal: 20 })).status, 201);
  assert.equal((await request(`${session}/jugar`, 'POST', { idPersonajes: [ids.character, ids.otherCharacter] })).status, 200);
  assert.equal((await request(`${session}/finalizar`, 'POST')).status, 409);
  const path = `/misiones/${ids.game}/1/1/completar`;
  const rewards = { recompensas: [{ idPersonaje: ids.character, dinero: 10, xp: 20 }] };
  assert.equal((await request(path, 'POST', rewards, playerCookie)).status, 403);
  const results = await Promise.all([request(path, 'POST', rewards), request(path, 'POST', rewards)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const p = await orm.em.fork().findOneOrFail(Personaje, { idPersonaje: ids.character }); assert.equal(p.dinero, 110); assert.equal(p.xp, 20);
  assert.equal((await request(`${session}/finalizar`, 'POST')).status, 200);
  assert.equal((await request(`${session}/calificar`, 'POST', { valor: 1 }, playerCookie)).status, 200);
  assert.equal((await request(`${session}/calificar`, 'POST', { valor: 1 }, playerCookie)).status, 409);
  assert.equal((await request(`${session}/calificar`, 'POST', { valor: 1 })).status, 409);
  assert.equal((await request(session, 'DELETE')).status, 409);
});
test('misiones y sesiones planificadas permiten CRUD completo', async () => {
  await request('/sesiones', 'POST', { idPartida: ids.game, numSesion: 1, duracionSesion: 60 });
  const data = { idPartida: ids.game, numSesion: 1, numMision: 1, descripcion: 'Plan', dineroTotal: 10, xpTotal: 20 };
  assert.equal((await request('/misiones', 'POST', data)).status, 201);
  const path = `/misiones/${ids.game}/1/1`;
  assert.equal((await request(path)).body.descripcion, 'Plan');
  assert.equal((await request(path, 'PUT', { descripcion: 'Otro plan', dineroTotal: 5, xpTotal: 6 })).status, 200);
  assert.equal((await request(path, 'DELETE')).status, 204);
  assert.equal((await request(`/sesiones/${ids.game}/1`, 'DELETE')).status, 204);
});

test('migración explícita de usuarios y partidas, diagnóstico sin escritura e idempotencia', async () => {
  const em = orm.em.fork();
  const user = await em.findOneOrFail(Usuario, { idUsuario: ids.player });
  const game = await em.findOneOrFail(Partida, { idPartida: ids.game });
  user.contrasena = 'legado123'; game.contrasena = 'partida123'; await em.flush();
  const run = (apply: boolean) => execFileSync(process.execPath, [resolve(__dirname, '../scripts/migrate-passwords.js'), ...(apply ? ['--apply'] : [])], { encoding: 'utf8', env: { ...process.env, DB_HOST: process.env.TEST_DB_HOST ?? '127.0.0.1', DB_PORT: process.env.TEST_DB_PORT, DB_USER: process.env.TEST_DB_USER ?? 'root', DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? '', DB_NAME: database }, timeout: 15000 });
  assert.match(run(false), /Modo diagnóstico/);
  assert.equal((await orm.em.fork().findOneOrFail(Usuario, { idUsuario: ids.player })).contrasena, 'legado123');
  const output = run(true); assert.doesNotMatch(output, /legado123|partida123/);
  assert.ok(await verifyPassword('legado123', (await orm.em.fork().findOneOrFail(Usuario, { idUsuario: ids.player })).contrasena));
  assert.ok(await verifyPassword('partida123', (await orm.em.fork().findOneOrFail(Partida, { idPartida: ids.game })).contrasena));
  assert.match(run(true), /0 usuarios y 0 partidas/);
});
