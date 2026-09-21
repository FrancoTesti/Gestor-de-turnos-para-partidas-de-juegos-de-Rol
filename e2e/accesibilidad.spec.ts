import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { crearCatalogoBase, ingresar, registrar } from './helpers';

const PANTALLAS = [
  ['/dashboard', 'dashboard'],
  ['/users', 'usuarios'],
  ['/objects', 'objetos'],
  ['/classes', 'clases'],
  ['/stores', 'tiendas'],
  ['/games', 'partidas'],
  ['/characters', 'personajes'],
  ['/sessions', 'sesiones'],
  ['/missions', 'misiones'],
  ['/inventory', 'inventarios'],
  ['/profiles', 'perfiles'],
] as const;

test('las pantallas principales no tienen violaciones graves de accesibilidad', async ({ page }) => {
  await registrar(page, 'accesibilidad_e2e');
  await ingresar(page, 'accesibilidad_e2e');
  await crearCatalogoBase(page, 'accesibilidad');

  const problemas: string[] = [];

  for (const [ruta, nombre] of PANTALLAS) {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const graves = resultado.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
    for (const violacion of graves) {
      const nodo = violacion.nodes[0];
      problemas.push(
        `${nombre}: ${violacion.id} (${violacion.impact}) — ${violacion.nodes.length} elemento(s)\n` +
        `    objetivo: ${nodo?.target?.join(' ')}\n` +
        `    html: ${nodo?.html}\n` +
        `    detalle: ${nodo?.failureSummary?.replace(/\n/g, ' ')}`,
      );
    }
  }

  expect(problemas, `Violaciones graves de accesibilidad:\n${problemas.join('\n')}`).toEqual([]);
});

test('login y registro no tienen violaciones graves de accesibilidad', async ({ browser }) => {
  const contexto = await browser.newContext({ baseURL: 'http://127.0.0.1:5174' });
  const page = await contexto.newPage();
  const problemas: string[] = [];
  try {
    for (const ruta of ['/login', '/register']) {
      await page.goto(ruta);
      await page.waitForLoadState('networkidle');
      const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      for (const violacion of resultado.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')) {
        problemas.push(`${ruta}: ${violacion.id} (${violacion.impact}) — ${violacion.help} — primero: ${violacion.nodes[0]?.target?.join(' ')}`);
      }
    }
  } finally {
    await contexto.close();
  }
  expect(problemas, `Violaciones graves en pantallas públicas:\n${problemas.join('\n')}`).toEqual([]);
});
