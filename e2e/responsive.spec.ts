import { test, expect, type Page } from '@playwright/test';
import { crearCatalogoBase, ingresar, registrar } from './helpers';

const ANCHOS = [375, 768, 1280];

const PANTALLAS_PRIVADAS = [
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
  ['/ruta-que-no-existe', 'no-encontrada'],
] as const;

const PANTALLAS_PUBLICAS = [
  ['/login', 'login'],
  ['/register', 'registro'],
] as const;

type Desborde = { selector: string; izquierda: number; derecha: number };

type Medicion = {
  anchoVentana: number;
  anchoDocumento: number;
  desbordes: Desborde[];
  recortados: Desborde[];
};

async function medir(page: Page): Promise<Medicion> {
  return page.evaluate(() => {
    const anchoVentana = window.innerWidth;

    // Un elemento que sobresale pero vive dentro de un contenedor previsto para tablas anchas
    // es aceptable: la tabla se recorre con scroll propio en lugar de arrastrar toda la pantalla.
    // No alcanza con cualquier contenedor: el área principal entera no debe desplazarse.
    const contenedoresValidos = /tabla-scroll|module-table|table-wrapper/;
    const enContenedorDesplazable = (elemento: Element) => {
      let padre = elemento.parentElement;
      while (padre && padre !== document.body) {
        const estilo = window.getComputedStyle(padre);
        if (
          contenedoresValidos.test(padre.className || '') &&
          (estilo.overflowX === 'auto' || estilo.overflowX === 'scroll')
        ) return true;
        padre = padre.parentElement;
      }
      return false;
    };

    const desbordes: Desborde[] = [];
    const recortados: Desborde[] = [];
    for (const elemento of Array.from(document.querySelectorAll('body *'))) {
      const caja = elemento.getBoundingClientRect();
      if (caja.width === 0 || caja.height === 0) continue;
      if (caja.right > anchoVentana + 1 || caja.left < -1) {
        const clases = typeof elemento.className === 'string' ? elemento.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        const desborde = {
          selector: `${elemento.tagName.toLowerCase()}${clases ? `.${clases}` : ''}`,
          izquierda: Math.round(caja.left),
          derecha: Math.round(caja.right),
        };
        if (enContenedorDesplazable(elemento)) desbordes.push(desborde);
        else recortados.push(desborde);
      }
    }
    const deduplicar = (lista: Desborde[]) => {
      const unicos = new Map<string, Desborde>();
      for (const desborde of lista) if (!unicos.has(desborde.selector)) unicos.set(desborde.selector, desborde);
      return [...unicos.values()].slice(0, 10);
    };
    return {
      anchoVentana,
      anchoDocumento: document.documentElement.scrollWidth,
      desbordes: deduplicar(desbordes),
      recortados: deduplicar(recortados),
    };
  });
}

async function esperarCarga(page: Page) {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('main, section, form').first()).toBeVisible();
}

test('ninguna pantalla desborda horizontalmente en 375, 768 y 1280', async ({ page }, testInfo) => {
  await registrar(page, 'responsive_e2e');
  await ingresar(page, 'responsive_e2e');
  await crearCatalogoBase(page, 'responsive');

  const problemas: string[] = [];

  for (const ancho of ANCHOS) {
    await page.setViewportSize({ width: ancho, height: 900 });
    for (const [ruta, nombre] of PANTALLAS_PRIVADAS) {
      await page.goto(ruta);
      await esperarCarga(page);
      const medicion = await medir(page);
      await page.screenshot({ path: testInfo.outputPath(`${nombre}-${ancho}.png`), fullPage: true });
      if (medicion.anchoDocumento > medicion.anchoVentana + 1 || medicion.recortados.length) {
        problemas.push(
          `${nombre} a ${ancho}px: documento ${medicion.anchoDocumento}px, ventana ${medicion.anchoVentana}px` +
          (medicion.recortados.length ? `, recortados: ${medicion.recortados.map(d => `${d.selector} (${d.izquierda}..${d.derecha})`).join(', ')}` : ''),
        );
      }
    }
  }

  expect(problemas, `Pantallas con desborde horizontal:\n${problemas.join('\n')}`).toEqual([]);
});

test('login y registro no desbordan en pantalla chica', async ({ browser }, testInfo) => {
  const contexto = await browser.newContext({ viewport: { width: 375, height: 800 }, baseURL: 'http://127.0.0.1:5174' });
  const page = await contexto.newPage();
  const problemas: string[] = [];
  try {
    for (const [ruta, nombre] of PANTALLAS_PUBLICAS) {
      await page.goto(ruta);
      await esperarCarga(page);
      const medicion = await medir(page);
      await page.screenshot({ path: testInfo.outputPath(`${nombre}-375.png`), fullPage: true });
      if (medicion.anchoDocumento > medicion.anchoVentana + 1 || medicion.recortados.length) {
        problemas.push(`${nombre} a 375px: documento ${medicion.anchoDocumento}px, recortados: ${medicion.recortados.map(d => d.selector).join(', ')}`);
      }
    }
  } finally {
    await contexto.close();
  }
  expect(problemas, `Pantallas públicas con desborde:\n${problemas.join('\n')}`).toEqual([]);
});
