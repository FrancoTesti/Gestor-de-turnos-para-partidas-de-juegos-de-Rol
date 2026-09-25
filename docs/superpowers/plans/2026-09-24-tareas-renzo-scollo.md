# Tareas pendientes de Renzo Scollo: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los cuatro entregables que `docs/plan_final_dsw.md` asigna a Renzo Scollo: evidencia de los tests automáticos, revisión humana de las capturas responsive, actualización de la matriz de entrega y cobertura de las pruebas de integración.

**Architecture:** Todo el trabajo es de verificación y documentación, más una pieza de infraestructura de medición. No cambia el comportamiento de la aplicación: agrega dos documentos nuevos, corrige una fila de `docs/entrega.md`, agrega un script npm que instrumenta la suite de integración con `c8` y publica los números reales.

**Tech Stack:** Node 24, TypeScript, Vitest 4 (cobertura v8), Playwright (capturas), MySQL 8 para integración, c8 para instrumentar el runner de Node.

**Spec:** `docs/plan_final_dsw.md` (sección «Renzo Scollo — Evidencia automática y coherencia documental»).

## Global Constraints

- Rama de trabajo: `renzo/plan-renzo-24-09`, creada desde `origin/main` (`4bb8ef6`).
- Nadie fusiona con la integración continua en rojo.
- Los números que se publiquen deben salir de una corrida real, nunca de una estimación.
- Las pruebas de integración y los recorridos de navegador necesitan `TEST_DB_PORT` y el resto de las variables `TEST_DB_*`; nunca usan `DB_NAME`.
- No se toca la lógica de negocio ni los estilos: si la revisión de capturas encuentra algo roto, se corrige CSS con su verificación, y nada más.
- `npm run docs:check` debe pasar después de cada documento tocado.

---

### Task 1: Evidencia de la ejecución de los tests automáticos

**Files:**
- Create: `docs/evidencia_tests.md`
- Modify: `docs/README.md` (agregar el documento al índice)

**Interfaces:**
- Consumes: los scripts `npm test`, `npm run test:integration`, `npm run test:coverage` (backend y frontend) y `npm run test:e2e`.
- Produces: `docs/evidencia_tests.md`, citado por `docs/entrega.md` y por la defensa oral.

- [ ] **Step 1: Correr las suites del backend y guardar la salida real**

```powershell
$settings = @{}; Get-Content -LiteralPath .env | ForEach-Object { if ($_ -match '^\s*([^#][^=]*)=(.*)$') { $settings[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'") } }
$env:TEST_DB_HOST = $settings['DB_HOST']; $env:TEST_DB_PORT = $settings['DB_PORT']; $env:TEST_DB_USER = $settings['DB_USER']; $env:TEST_DB_PASSWORD = $settings['DB_PASSWORD']
npm run build
npm test
npm run test:integration
npm run test:coverage
```

Expected: build sin errores, 102 pruebas unitarias aprobadas, 22 de integración aprobadas y umbrales de cobertura aprobados.

- [ ] **Step 2: Correr las suites del frontend y los recorridos de navegador**

```powershell
cd frontend
npm run build
npm run lint
npm test
npm run test:coverage
cd ..
npm run test:e2e
```

Expected: build correcto, lint sin errores ni advertencias, 71 pruebas aprobadas y 9 recorridos de navegador aprobados.

- [ ] **Step 3: Escribir el documento con los resultados**

Crear `docs/evidencia_tests.md` con esta estructura y los números reales de los pasos anteriores:

```markdown
# Evidencia de la ejecución de los tests automáticos

Fecha: 24 de septiembre de 2026.
Commit evaluado: <hash de main o de la rama>.
Ejecución en GitHub Actions: <enlace al run verde>.

| Suite | Comando | Resultado |
| --- | --- | --- |
| Unitarias backend | `npm test` | 13 archivos, 102 pruebas aprobadas |
| Integración MySQL | `npm run test:integration` | 22 pruebas aprobadas |
| Cobertura backend | `npm run test:coverage` | 30,75 % de líneas, umbral 30 % |
| Unitarias frontend | `cd frontend && npm test` | 19 archivos, 71 pruebas aprobadas |
| Cobertura frontend | `cd frontend && npm run test:coverage` | 47,42 % de líneas, umbral 47 % |
| End-to-end | `npm run test:e2e` | 9 recorridos aprobados |

## Qué cubre cada suite

<párrafo por suite, tomado de docs/pruebas_manuales.md>

## Cómo reproducirlo

<comandos de instalación previa y ejecución, incluida la advertencia de la base descartable>
```

- [ ] **Step 4: Verificar los enlaces y publicar**

```powershell
npm run docs:check
git add docs/evidencia_tests.md docs/README.md
git commit -m "docs: publicar la evidencia de los tests automaticos"
```

Expected: el verificador informa los archivos de documentación sin errores.

### Task 2: Revisión humana de las capturas responsive

**Files:**
- Create: `docs/evidencia_responsive_revision.md`
- Modify: `frontend/src/**/*.css` solo si aparece un defecto visual concreto

**Interfaces:**
- Consumes: `e2e/responsive.spec.ts`, que genera las capturas en `test-results/responsive-*/`.
- Produces: `docs/evidencia_responsive_revision.md` con los hallazgos y, si corresponde, correcciones de CSS verificadas.

- [ ] **Step 1: Generar las capturas**

```powershell
$env:TEST_DB_PORT = '<puerto de pruebas>'
npx playwright test e2e/responsive.spec.ts
Get-ChildItem -Recurse test-results -Filter *.png | Select-Object FullName
```

Expected: 38 imágenes, una por pantalla y ancho, más las dos públicas.

- [ ] **Step 2: Mirar las capturas críticas**

Abrir con el visor de imágenes, en 375 y en 1280: `partidas`, `sesiones`, `misiones`, `inventarios`, `perfiles`.

Criterios: nada cortado, ningún texto encimado, los botones alcanzables, las tablas legibles y sin franjas vacías enormes.

- [ ] **Step 3: Escribir el documento con los hallazgos**

```markdown
# Revisión humana de las capturas responsive

Fecha: 24 de septiembre de 2026.
Corrida: `npx playwright test e2e/responsive.spec.ts`.

| Pantalla | 375 px | 768 px | 1280 px | Observación |
| --- | --- | --- | --- | --- |
| Partidas | OK / problema | ... | ... | ... |

## Problemas encontrados y corrección

<por cada problema: captura, archivo, cambio y verificación posterior>
```

- [ ] **Step 4: Corregir y volver a verificar si hay defectos**

```powershell
npx playwright test e2e/responsive.spec.ts
npm --prefix frontend run build
git add docs/evidencia_responsive_revision.md frontend/src
git commit -m "docs: registrar la revision manual de las capturas responsive"
```

Expected: la suite vuelve a pasar y el documento queda con la lista de hallazgos.

### Task 3: Actualizar la matriz de entrega

**Files:**
- Modify: `docs/entrega.md` (fila «Revisión responsive y de accesibilidad completa»)

**Interfaces:**
- Consumes: `docs/evidencia_calidad_visual.md` y `docs/evidencia_responsive_revision.md`.
- Produces: la matriz de requisitos sin datos viejos.

- [ ] **Step 1: Reemplazar la fila desactualizada**

Buscar en `docs/entrega.md`:

```markdown
| Revisión responsive y de accesibilidad completa | Parcial | Revisadas las pantallas de cuentas, perfiles, clases, tiendas y personajes; falta recorrer el resto en pantalla chica |
```

Reemplazar por:

```markdown
| Revisión responsive y de accesibilidad completa | Cerrado | `e2e/responsive.spec.ts` (12 pantallas × 3 anchos) y `e2e/accesibilidad.spec.ts` (axe-core sin violaciones graves). Revisión humana de las capturas en `docs/evidencia_responsive_revision.md` |
```

- [ ] **Step 2: Verificar y publicar**

```powershell
npm run docs:check
git add docs/entrega.md
git commit -m "docs: actualizar el estado de la revision responsive"
```

Expected: enlaces sin errores y matriz coherente con la evidencia.

### Task 4: Instrumentar la cobertura de las pruebas de integración

**Files:**
- Modify: `package.json` (script `test:coverage:integration`)
- Modify: `docs/instalacion.md` (cómo se corre y qué mide)
- Modify: `docs/evidencia_tests.md` (números reales de la suite instrumentada)

**Interfaces:**
- Consumes: `npm run test:integration`, que compila y ejecuta `dist/integration/juego.test.js`.
- Produces: `npm run test:coverage:integration`, con umbrales que fallan si la cobertura baja.

- [ ] **Step 1: Instalar c8 y agregar el script**

```powershell
npm install --save-dev c8
```

Agregar en `package.json`, dentro de `scripts`:

```json
"test:coverage:integration": "npm run build && c8 --reporter=text --reporter=json-summary --reports-dir=coverage/integracion --check-coverage --lines 40 --functions 30 --branches 30 --statements 40 node --test --test-concurrency=1 dist/integration/juego.test.js"
```

- [ ] **Step 2: Medir la cobertura real de la integración**

```powershell
$env:TEST_DB_PORT = '<puerto de pruebas>'
npm run test:coverage:integration
```

Expected: la suite pasa y c8 imprime una tabla con el porcentaje real por archivo. Anotar los cuatro porcentajes globales.

- [ ] **Step 3: Ajustar los umbrales al valor medido**

Reemplazar los cuatro números del script por el valor medido redondeado hacia abajo, para que funcionen como freno contra regresiones:

```json
"test:coverage:integration": "npm run build && c8 --reporter=text --reporter=json-summary --reports-dir=coverage/integracion --check-coverage --lines <medido> --functions <medido> --branches <medido> --statements <medido> node --test --test-concurrency=1 dist/integration/juego.test.js"
```

- [ ] **Step 4: Verificar que el umbral realmente falla cuando debe**

```powershell
npm run test:coverage:integration -- --lines 99
```

Expected: el comando termina con error de cobertura, lo que demuestra que el umbral se evalúa.

- [ ] **Step 5: Documentar y publicar**

Agregar en `docs/instalacion.md`, dentro de la sección de pruebas, el comando nuevo y qué mide. Actualizar `docs/evidencia_tests.md` con los números de la integración instrumentada.

```powershell
npm run docs:check
git add package.json package-lock.json docs/instalacion.md docs/evidencia_tests.md
git commit -m "test: medir la cobertura de la suite de integracion"
```

## Self-Review

**Cobertura del spec:** los cuatro entregables de Renzo en `docs/plan_final_dsw.md` tienen una tarea cada uno. La evidencia de tests cubre el requisito de aprobación directa; la revisión de capturas y la fila de la matriz cierran la deuda de documentación; la cobertura de integración responde al punto de subir los umbrales.

**Marcadores pendientes:** las únicas partes con valores entre `<>` son los números de cobertura, que por definición se conocen recién en el paso 2 de la tarea 4, y el puerto de pruebas, que depende de la máquina. El resto de los pasos trae el contenido real.

**Consistencia:** los nombres de archivo, los comandos y los scripts coinciden con los que ya existen en el repositorio (`test:e2e`, `test:integration`, `test:coverage`, `docs:check`).
