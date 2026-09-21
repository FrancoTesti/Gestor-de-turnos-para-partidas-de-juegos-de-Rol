import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'PruebaSegura123';

export async function registrar(page: Page, nickname: string, tipo = 'Anfitrión') {
  await page.goto('/register');
  await page.getByPlaceholder('Nombre y apellido').fill('Anfitrión de prueba');
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill(PASSWORD);
  await page.getByPlaceholder('Repetir contraseña', { exact: true }).fill(PASSWORD);
  await page.getByLabel(tipo, { exact: true }).check();
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function ingresar(page: Page, nickname: string) {
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export type CatalogoBase = {
  idClase: number;
  idTienda: number;
  idObjeto: number;
  idPartida: number;
  idSesion: number;
};

/**
 * Crea el catálogo mínimo por API, para que las pantallas se revisen con filas reales
 * en lugar de tablas vacías. Usa la sesión del navegador que recibe por parámetro.
 */
export async function crearCatalogoBase(page: Page, sufijo: string): Promise<CatalogoBase> {
  const usuario = await page.request.get('/api/auth/me');
  expect(usuario.ok()).toBeTruthy();
  const idUsuario = (await usuario.json()).usuario.idUsuario as number;

  const clase = await page.request.post('/api/clases', {
    data: { nombreClase: `Clase ${sufijo}`, descripcionClase: 'Clase de prueba responsive' },
  });
  expect(clase.status()).toBe(201);
  const idClase = (await clase.json()).idClase as number;

  const tienda = await page.request.post('/api/tiendas', {
    data: { nombre: `Tienda ${sufijo}`, claseTienda: 'Armas', idClase },
  });
  expect(tienda.status()).toBe(201);
  const idTienda = (await tienda.json()).idTienda as number;

  const objeto = await page.request.post('/api/objetos', {
    data: {
      nombre: `Objeto ${sufijo}`,
      descripcion: 'Objeto de prueba responsive',
      tipoObjeto: 'Arma',
      valor: 30,
      nivelObjeto: 1,
      esUnico: false,
      posicion: 0,
      idTienda,
    },
  });
  expect(objeto.status()).toBe(201);
  const idObjeto = (await objeto.json()).idObjeto as number;

  const partida = await page.request.post('/api/partidas', {
    data: {
      nombre: `Partida ${sufijo}`,
      estado: 'activa',
      limiteJugadores: 4,
      esPrivada: false,
      idUsuarioAnfitrion: idUsuario,
    },
  });
  expect(partida.status()).toBe(201);
  const idPartida = (await partida.json()).idPartida as number;

  const sesion = await page.request.post('/api/sesiones', {
    data: { idPartida, numSesion: 1, duracionSesion: 60 },
  });
  expect(sesion.status()).toBe(201);

  return { idClase, idTienda, idObjeto, idPartida, idSesion: 1 };
}
