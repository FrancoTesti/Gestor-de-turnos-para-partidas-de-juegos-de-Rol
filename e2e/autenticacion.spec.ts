import { test, expect, type Page } from '@playwright/test';

async function registrar(page: Page, nickname: string, tipo = 'Anfitrión') {
  await page.goto('/register');
  await page.getByPlaceholder('Nombre y apellido').fill('Anfitrión de prueba');
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByLabel(tipo, { exact: true }).check();
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function ingresar(page: Page, nickname: string) {
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('registro, login, partida y sesión persistentes; expiración de autenticación', async ({ page, context }) => {
  await registrar(page, 'host_e2e');
  await ingresar(page, 'host_e2e');
  await page.goto('/games');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Campaña E2E');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Campaña E2E' })).toBeVisible();
  await page.goto('/sessions');
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  const partida = page.getByRole('combobox', { name: 'Partida', exact: true });
  const option = await partida.locator('option').filter({ hasText: 'Campaña E2E' }).getAttribute('value');
  expect(option).toBeTruthy();
  await partida.selectOption(option!);
  await page.getByLabel('Número de sesión', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Guardar', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'Planificada', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: 'Planificada', exact: true })).toBeVisible();
  // Invalida la cookie en el servidor, sin cambiar el estado React: el próximo 401 debe limpiar la sesión.
  const logout = await context.request.post('/api/auth/logout');
  expect(logout.ok()).toBeTruthy();
  await page.getByRole('button', { name: 'Actualizar listado' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/sessions');
  await expect(page).toHaveURL(/\/login$/);
});

test('cerrar sesión impide volver a las páginas privadas', async ({ page }) => {
  await registrar(page, 'logout_e2e');
  await ingresar(page, 'logout_e2e');
  await page.getByRole('button', { name: 'Cerrar Sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/games');
  await expect(page).toHaveURL(/\/login$/);
});

test('dos usuarios completan juego, recompensas, karma y comercio con inventarios', async ({ page: host, browser }) => {
  const player = await browser.newPage({ baseURL: 'http://127.0.0.1:5174' });
  try {
    await registrar(host, 'director_juego');
    await ingresar(host, 'director_juego');
    await host.goto('/classes');
    await host.getByRole('button', { name: '+ Nueva Clase', exact: true }).click();
    await host.getByLabel('Nombre de la Clase *', { exact: true }).fill('Explorador E2E');
    await host.getByLabel('Descripción de la Clase *', { exact: true }).fill('Exploración y supervivencia');
    await host.getByRole('button', { name: 'Crear Clase', exact: true }).click();
    await expect(host.getByRole('status')).toContainText('Clase creada correctamente');
    await host.goto('/games');
    await host.getByRole('button', { name: 'Crear', exact: true }).click();
    await host.getByLabel('Nombre', { exact: true }).fill('Aventura compartida');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(host.getByRole('row').filter({ hasText: 'Aventura compartida' })).toBeVisible();

    await registrar(player, 'jugador_aventura', 'Jugador');
    await ingresar(player, 'jugador_aventura');
    await player.goto('/characters');
    await player.getByRole('button', { name: '+ Crear Personaje', exact: true }).click();
    await player.getByLabel('Nombre ficticio *', { exact: true }).fill('Arwen E2E');
    await player.getByLabel('Raza *', { exact: true }).fill('Elfa');
    await player.getByRole('combobox', { name: 'Clase de personaje *', exact: true }).selectOption({ label: 'Explorador E2E' });
    const games = player.getByRole('combobox', { name: 'Partida *', exact: true });
    const gameId = await games.locator('option').filter({ hasText: 'Aventura compartida' }).getAttribute('value');
    await games.selectOption(gameId!);
    await player.getByRole('button', { name: 'Crear Personaje', exact: true }).click();
    await expect(player.getByRole('status')).toContainText('Personaje creado correctamente');

    await host.goto('/sessions');
    await host.getByRole('button', { name: 'Crear', exact: true }).click();
    await host.getByRole('combobox', { name: 'Partida', exact: true }).selectOption(gameId!);
    await host.getByLabel('Número de sesión', { exact: true }).fill('1');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    const sessionRow = host.getByRole('row').filter({ hasText: 'Aventura compartida' });
    await sessionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await host.getByRole('checkbox', { name: 'Arwen E2E', exact: true }).check();
    await host.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
    await expect(sessionRow).toContainText('En curso');

    await host.goto('/missions');
    await host.getByRole('button', { name: 'Crear', exact: true }).click();
    await host.getByRole('combobox', { name: 'Partida', exact: true }).selectOption(gameId!);
    await host.getByLabel('Número de sesión', { exact: true }).fill('1');
    await host.getByLabel('Número de misión', { exact: true }).fill('1');
    await host.getByLabel('Descripción', { exact: true }).fill('Rescatar al mercader');
    await host.getByLabel('Dinero total', { exact: true }).fill('100');
    await host.getByLabel('XP total', { exact: true }).fill('50');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    const missionRow = host.getByRole('row').filter({ hasText: 'Rescatar al mercader' });
    await missionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await host.getByLabel('dinero', { exact: true }).fill('100');
    await host.getByLabel('xp', { exact: true }).fill('50');
    await host.getByRole('button', { name: 'Completar misión', exact: true }).click();
    await expect(missionRow).toContainText('Completada');
    await missionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(host.getByRole('button', { name: 'Completar misión', exact: true })).toHaveCount(0);

    await player.reload();
    const stats = player.locator('.personaje-card').filter({ hasText: 'Arwen E2E' });
    await expect(stats.locator('.stat-item').filter({ hasText: 'XP' }).locator('.stat-val')).toHaveText('50');
    await expect(stats.locator('.stat-item').filter({ hasText: 'Dinero' }).locator('.stat-val')).toHaveText('🪙 200');
    await host.goto('/sessions');
    await sessionRow.getByRole('button', { name: 'Ver detalle' }).click();
    await host.getByRole('button', { name: 'Finalizar sesión', exact: true }).click();
    await expect(sessionRow).toContainText('Finalizada');
    await player.goto('/sessions');
    await player.getByRole('row').filter({ hasText: 'Aventura compartida' }).getByRole('button', { name: 'Ver detalle' }).click();
    await player.getByRole('button', { name: 'Buena experiencia (+1)', exact: true }).click();
    await expect(player.getByRole('heading', { name: 'Detalle', exact: true })).toHaveCount(0);
    await host.goto('/profiles');
    await expect(host.getByText('Karma: 1. Partidas activas: 1', { exact: true })).toBeVisible();

    await host.goto('/stores');
    await host.getByRole('button', { name: '+ Nueva Tienda', exact: true }).click();
    await host.getByLabel('Nombre de la tienda *', { exact: true }).fill('Armería E2E');
    await host.getByRole('combobox', { name: 'Tipo de tienda *', exact: true }).selectOption('Armas');
    await host.getByRole('button', { name: 'Crear Tienda', exact: true }).click();
    await expect(host.getByRole('status')).toContainText('Tienda creada');
    await host.goto('/objects');
    await host.getByRole('button', { name: 'Nuevo objeto', exact: true }).click();
    await host.getByLabel('Nombre', { exact: true }).fill('Arco E2E');
    await host.getByLabel('Descripción', { exact: true }).fill('Arco de exploración');
    await host.getByLabel('Tipo', { exact: true }).fill('Arma');
    await host.getByLabel('Valor', { exact: true }).fill('40');
    await host.getByLabel('Nivel', { exact: true }).fill('1');
    await host.getByRole('combobox', { name: 'Tienda (opcional)', exact: true }).selectOption({ label: 'Armería E2E' });
    const createdObject = host.waitForResponse(r => r.url().endsWith('/api/objetos') && r.request().method() === 'POST');
    await host.getByRole('button', { name: 'Guardar', exact: true }).click();
    const objectResponse = await createdObject;
    expect(objectResponse.status()).toBe(201);
    const { idObjeto } = await objectResponse.json();
    await player.goto('/objects');
    await player.getByRole('button', { name: /Arco E2E/ }).click();
    await player.getByRole('button', { name: 'Comprar objeto', exact: true }).click();
    await player.getByRole('button', { name: 'Confirmar compra', exact: true }).click();
    await expect(player.getByRole('status')).toHaveText('Compra realizada. Dinero restante: 160.');

    await player.goto('/inventory');
    await player.getByRole('button', { name: 'Crear', exact: true }).click();
    const characterSelect = player.getByRole('combobox', { name: 'Personaje', exact: true });
    const characterId = await characterSelect.locator('option').filter({ hasText: 'Arwen E2E' }).getAttribute('value');
    await characterSelect.selectOption(characterId!);
    await player.getByLabel('Número de inventario', { exact: true }).fill('2');
    await player.getByLabel('Capacidad', { exact: true }).fill('3');
    await player.getByRole('button', { name: 'Guardar', exact: true }).click();
    const inventoryRow = player.locator('tbody tr').filter({ has: player.locator('td:nth-child(2)', { hasText: /^2$/ }) });
    await inventoryRow.getByRole('button', { name: 'Ver detalle' }).click();
    await player.getByLabel('ID de un objeto del personaje', { exact: true }).fill(String(idObjeto));
    await player.getByLabel('Posición (comienza en 0)', { exact: true }).fill('2');
    await player.getByRole('button', { name: 'Mover objeto', exact: true }).click();
    await expect(player.getByRole('heading', { name: 'Detalle', exact: true })).toHaveCount(0);
    await inventoryRow.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(player.getByText(`#${idObjeto} — Arco E2E — posición 2, valor 40`, { exact: true })).toBeVisible();
    await player.getByRole('combobox', { name: 'Objeto', exact: true }).selectOption(String(idObjeto));
    await player.getByRole('spinbutton', { name: /^Precio/ }).fill('28');
    await player.getByRole('combobox', { name: 'Tienda', exact: true }).selectOption({ label: 'Armería E2E' });
    await player.getByRole('button', { name: 'Vender', exact: true }).click();
    await expect(player.getByRole('heading', { name: 'Detalle', exact: true })).toHaveCount(0);
    await inventoryRow.getByRole('button', { name: 'Ver detalle' }).click();
    await expect(player.getByRole('combobox', { name: 'Objeto', exact: true }).locator('option', { hasText: 'Arco E2E' })).toHaveCount(0);
    await player.goto('/characters');
    await expect(stats.locator('.stat-item').filter({ hasText: 'Dinero' }).locator('.stat-val')).toHaveText('🪙 188');
  } finally {
    await player.close();
  }
});
