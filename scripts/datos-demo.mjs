// Carga los datos de demostración a través de la API: dm_demo, jugador_demo y un catálogo mínimo.
// Usa los mismos endpoints que la interfaz, así que respeta validaciones y permisos del servidor.
// Se puede ejecutar varias veces: lo que ya existe (por nickname o por nombre) no se duplica.
// Requiere el backend corriendo (npm run dev). Uso: npm run demo:datos

const api = (process.env.DEMO_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
const contrasena = 'PruebaSegura123';

const cuentas = [
  { tipo: 'anfitrion', nickname: 'dm_demo', nombreUsuario: 'Anfitrión Demo' },
  { tipo: 'jugador', nickname: 'jugador_demo', nombreUsuario: 'Jugador Demo' },
];

const clases = [
  { nombreClase: 'Guerrero', descripcionClase: 'Combatiente cuerpo a cuerpo, resistente y con armadura pesada.' },
  { nombreClase: 'Mago', descripcionClase: 'Lanzador de hechizos que depende de su conocimiento arcano.' },
];

const tiendas = [
  { nombre: 'Herrería del Puerto', claseTienda: 'Armas', clase: 'Guerrero' },
  { nombre: 'Torre Arcana', claseTienda: 'Magia', clase: 'Mago' },
];

const objetos = [
  { nombre: 'Espada corta', descripcion: 'Hoja de acero confiable para principiantes.', tipoObjeto: 'Arma', valor: 30, nivelObjeto: 1, esUnico: false, tienda: 'Herrería del Puerto' },
  { nombre: 'Escudo de roble', descripcion: 'Escudo liviano reforzado con hierro.', tipoObjeto: 'Armadura', valor: 45, nivelObjeto: 2, esUnico: false, tienda: 'Herrería del Puerto' },
  { nombre: 'Báculo de aprendiz', descripcion: 'Canaliza hechizos simples.', tipoObjeto: 'Arma', valor: 35, nivelObjeto: 1, esUnico: false, tienda: 'Torre Arcana' },
  { nombre: 'Orbe del Archimago', descripcion: 'Reliquia irrepetible: solo un personaje por partida puede tenerla.', tipoObjeto: 'Reliquia', valor: 90, nivelObjeto: 3, esUnico: true, tienda: 'Torre Arcana' },
];

async function pedir(ruta, { method = 'GET', body, cookie } = {}) {
  let res;
  try {
    res = await fetch(`${api}${ruta}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(`No se pudo conectar con ${api}. ¿Está corriendo el backend (npm run dev)?`);
  }
  const texto = await res.text();
  const datos = texto ? JSON.parse(texto) : undefined;
  return { status: res.status, datos, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}

function exigir(respuesta, esperado, que) {
  if (respuesta.status !== esperado) throw new Error(`${que}: HTTP ${respuesta.status} ${respuesta.datos?.message ?? ''}`.trim());
  return respuesta.datos;
}

async function asegurarCuenta({ tipo, nickname, nombreUsuario }) {
  const alta = await pedir('/auth/register', { method: 'POST', body: { tipo, nickname, nombreUsuario, contrasena } });
  if (alta.status === 201) console.log(`+ cuenta ${nickname} (${tipo})`);
  else if (alta.status === 409) console.log(`= cuenta ${nickname} ya existía`);
  else exigir(alta, 201, `Registrar ${nickname}`);

  const login = await pedir('/auth/login', { method: 'POST', body: { nickname, contrasena } });
  if (login.status === 401) {
    throw new Error(`${nickname} existe pero no acepta la contraseña de demo. Si se cambió durante un ensayo, restaurar la base o volver a ponerla desde «Mis perfiles».`);
  }
  exigir(login, 200, `Entrar como ${nickname}`);
  if (tipo === 'anfitrion' && !login.datos.roles.anfitrion) throw new Error(`${nickname} existe pero no tiene perfil de anfitrión.`);
  if (tipo === 'jugador' && !login.datos.roles.jugador) throw new Error(`${nickname} existe pero no tiene perfil de jugador.`);
  return login.cookie;
}

async function asegurar(recurso, cookie, clave, valor, cuerpo, idCampo) {
  const existentes = exigir(await pedir(`/${recurso}`, { cookie }), 200, `Listar ${recurso}`);
  const previo = existentes.find(e => e[clave] === valor);
  if (previo) { console.log(`= ${recurso}: ${valor} ya existía`); return previo[idCampo]; }
  const creado = exigir(await pedir(`/${recurso}`, { method: 'POST', body: cuerpo, cookie }), 201, `Crear ${recurso} ${valor}`);
  console.log(`+ ${recurso}: ${valor}`);
  return creado[idCampo];
}

async function main() {
  console.log(`Cargando datos de demostración en ${api}`);
  exigir(await pedir('/health'), 200, 'Comprobar el backend');

  const [cookieDm] = await Promise.all(cuentas.map(asegurarCuenta));

  const idClase = {};
  for (const c of clases) idClase[c.nombreClase] = await asegurar('clases', cookieDm, 'nombreClase', c.nombreClase, c, 'idClase');

  const idTienda = {};
  for (const { clase, ...t } of tiendas) {
    idTienda[t.nombre] = await asegurar('tiendas', cookieDm, 'nombre', t.nombre, { ...t, idClase: idClase[clase] }, 'idTienda');
  }

  for (const { tienda, ...o } of objetos) {
    await asegurar('objetos', cookieDm, 'nombre', o.nombre, { ...o, posicion: 0, idTienda: idTienda[tienda] }, 'idObjeto');
  }

  await pedir('/auth/logout', { method: 'POST', cookie: cookieDm });
  console.log(`Listo. Credenciales: dm_demo / ${contrasena} y jugador_demo / ${contrasena}`);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
