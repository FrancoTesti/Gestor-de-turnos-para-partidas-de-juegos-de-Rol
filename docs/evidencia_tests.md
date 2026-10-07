# Evidencia de la ejecución de los tests automáticos

Fecha de la corrida: 7 de octubre de 2026.

Código evaluado: `5594a36` de la rama `ImplementacionSupabase`, que migra la base de MySQL a PostgreSQL
(Supabase). La corrida anterior, del 24 de septiembre sobre `4bb8ef6` de `main`, fue contra MySQL.

Las suites de integración y de navegador se ejecutaron contra PostgreSQL real en Supabase, en un esquema
temporal que cada suite crea y elimina (`rpg_test_*`, `rpg_e2e_*`). Al terminar se comprobó que no quedó
ningún esquema residual. Las suites trabajan solo dentro de su esquema temporal y no escriben en `public`.

**Ejecución en GitHub Actions: pendiente.** El workflow se actualizó para usar un servicio `postgres:17`,
pero todavía no se ejecutó con PostgreSQL. Hasta la primera corrida verde, la evidencia de esta página
es local. El último run de Actions verde, contra MySQL, es el
[36076310572](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/36076310572).

## Resultado de cada suite

| Suite | Comando | Resultado |
| --- | --- | --- |
| Unitarias del backend | `npm test` | 18 archivos, **114 pruebas aprobadas** |
| Integración con PostgreSQL | `npm run test:integration` | **22 pruebas aprobadas** |
| Cobertura del backend | `npm run test:coverage` | 33,58 % de sentencias, 27,56 % de ramas, 43,72 % de funciones, 34,08 % de líneas (umbral: 32 %) |
| Unitarias del frontend | `cd frontend && npm test` | 19 archivos, **71 pruebas aprobadas** |
| Cobertura del frontend | `cd frontend && npm run test:coverage` | 45,93 % de sentencias, 42,14 % de ramas, 36,51 % de funciones, 47,56 % de líneas (umbral: 47 %) |
| Cobertura de la integración | `npm run test:coverage:integration` | 72,36 % de sentencias, 70,49 % de ramas, 69,00 % de funciones, 72,36 % de líneas (umbral: 70 %) |
| Compilación y lint | `npm run build` y `cd frontend && npm run build && npm run lint` | Sin errores ni advertencias (código de salida 0) |
| Recorridos de navegador | `E2E_TIMEOUT_MS=240000 npm run test:e2e` | **9 recorridos aprobados** en Chromium (4,8 min) |

Sobre los recorridos de navegador: con el límite por defecto de 60 s por prueba, **6 de 9 pasan y 3 se
cortan por tiempo** (accesibilidad, juego completo con dos cuentas y responsive). No son fallos de lógica:
al ampliar el límite a 240 s los 9 pasan. La causa es la latencia hacia la base remota: medida desde otro
continente, cada consulta tarda ~190 ms y abrir una conexión nueva ~1,1 s, y esos recorridos hacen
decenas de llamadas. Con el backend publicado en una región cercana a la base, esa latencia desaparece;
eso todavía no se midió porque la aplicación no está publicada (ver [despliegue.md](despliegue.md)).

## Qué cubre cada suite

**Unitarias del backend** (`src/tests`): servicios, controladores, validadores y esquemas. Incluye
usuarios, autenticación con contraseñas hasheadas, clases, tiendas, personajes, objetos —incluido el
atributo de objeto único—, reglas de venta, el servicio de juego y la defensa por encabezado `Origin`.

**Integración con PostgreSQL** (`src/integration/juego.test.ts`): registro y hash, login con cookie,
recuperación de sesión y logout, permisos por rol, perfiles y borrados con dependencias, partidas
públicas y privadas, creación de personaje con inventario, compra y venta con rollback real,
operaciones concurrentes, sesiones, misiones, recompensas y karma, y la migración de contraseñas.

**Unitarias del frontend** (`frontend/src/**/__tests__`): cliente HTTP con manejo de errores y
sesión expirada, contexto de usuario, pantallas de cuentas, perfiles, clases, tiendas, personajes,
sesiones, misiones, usuarios, componentes de interfaz y formularios de compra y venta.

**Recorridos de navegador** (`e2e`): registro y login reales, partida y sesión persistentes,
expiración de cookie, cierre de sesión, bloqueo de rutas privadas, juego completo con dos cuentas
—recompensas, karma, compra, inventario, movimiento y venta—, caminos rechazados por el servidor,
auditoría de accesibilidad con axe-core y revisión responsive en 375, 768 y 1280 píxeles.

Cada suite tiene su propia medición y su propio umbral, y las tres se ejecutan por separado:

- Las unitarias del backend cubren servicios, controladores, validadores y seguridad de forma
  aislada. Su umbral es bajo porque buena parte del comportamiento se prueba en la integración.
- La suite de integración se instrumenta con `c8` sobre el código compilado con mapas de origen:
  recorre el sistema completo contra PostgreSQL y alcanza el 72,36 % de líneas. Su umbral es 70 %.
- Las unitarias del frontend cubren componentes y servicios con jsdom; su umbral es 47 % de líneas.

Los porcentajes no se suman entre sí porque miden universos distintos. Los umbrales funcionan como
freno contra regresiones: si una suite pierde cobertura, la integración continua falla.

La integración continua ejecuta las tres mediciones —cobertura del backend, cobertura de la
integración y cobertura del frontend— y sube los informes como artefactos `cobertura-backend` y
`cobertura-frontend`. Si cualquiera baja del umbral, el trabajo queda en rojo y el PR no se fusiona.

## Lo que mostró la migración

La suite de integración detectó una diferencia real entre MySQL y PostgreSQL: `SELECT ... FOR UPDATE`
sobre el lado opcional de un `LEFT JOIN` falla en PostgreSQL y las operaciones de compra, venta y
movimiento de objetos respondían 500. Se corrigió y la suite quedó en 22 de 22; el detalle está en
[evidencia_concurrencia.md](evidencia_concurrencia.md).

## Verificación de los umbrales

Se comprobó que los umbrales se evalúan de verdad: ejecutar la suite de integración con `--lines 99`
termina con error y con el mensaje real de `c8` (demostración del 24 de septiembre; el mecanismo no
cambió con la migración):

```text
ERROR: Coverage for lines (71.96%) does not meet global threshold (99%)
```

## Cómo reproducirlo

Requiere una base PostgreSQL accesible por URL (por ejemplo, el proyecto de Supabase) y `TEST_DB_URL`.
Las suites de integración y de navegador crean su propio esquema temporal y nunca tocan `public`.

```powershell
npm ci
npm --prefix frontend ci
$env:TEST_DB_URL = 'postgresql://postgres.<codigo>:<contraseña>@aws-0-<region>.pooler.supabase.com:5432/postgres'
$env:E2E_TIMEOUT_MS = '240000'   # contra una base remota; con una base local alcanza el valor por defecto

# Backend
npm run build
npm test
npm run test:integration
npm run test:coverage
npm run test:coverage:integration

# Frontend
cd frontend
npm run build
npm run lint
npm test
npm run test:coverage
cd ..

# Navegador
npx playwright install chromium
npm run test:e2e
```

Las pruebas de navegador dejan las capturas y las trazas en `test-results/`, que no se versiona. La
integración continua publica ese directorio como artefacto `evidencia-e2e` en cada ejecución.
