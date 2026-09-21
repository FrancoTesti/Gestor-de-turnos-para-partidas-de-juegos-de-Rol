// Verifica que los enlaces relativos de la documentación apunten a archivos existentes.
// Falla con código 1 y lista los enlaces roto para que la integración continua los frene.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const archivos = [];

function recorrer(directorio) {
  for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'coverage', 'test-results', 'tmp', 'tools'].includes(entrada.name)) continue;
    const ruta = join(directorio, entrada.name);
    if (entrada.isDirectory()) recorrer(ruta);
    else if (entrada.name.endsWith('.md')) archivos.push(ruta);
  }
}

recorrer(raiz);

const roto = [];
const patron = /\[[^\]]*\]\(([^)\s]+)\)/g;

for (const archivo of archivos) {
  const contenido = readFileSync(archivo, 'utf8');
  for (const coincidencia of contenido.matchAll(patron)) {
    const destino = coincidencia[1];
    if (/^(https?:|mailto:|#)/.test(destino)) continue;
    const sinAncla = destino.split('#')[0];
    if (!sinAncla) continue;
    const objetivo = resolve(dirname(archivo), decodeURI(sinAncla));
    let existe = false;
    try {
      statSync(objetivo);
      existe = true;
    } catch {
      existe = false;
    }
    if (!existe) roto.push(`${relative(raiz, archivo)} -> ${destino}`);
  }
}

if (roto.length) {
  console.error(`Enlaces roto encontrados (${roto.length}):`);
  for (const linea of roto) console.error(`  ${linea}`);
  process.exit(1);
}

console.log(`Enlaces verificados en ${archivos.length} archivos de documentación, sin errores.`);
