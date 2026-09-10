import { test, expect, type Page } from '@playwright/test';

async function registrar(page: Page, nickname: string) {
  await page.goto('/register');
  await page.getByPlaceholder('Nombre y apellido').fill('Anfitrión de prueba');
  await page.getByPlaceholder('Nickname').fill(nickname);
  await page.getByPlaceholder('Contraseña', { exact: true }).fill('PruebaSegura123');
  await page.getByLabel('Anfitrión', { exact: true }).check();
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
