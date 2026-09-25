# Evidencia de la ejecución de los tests automáticos

Fecha de la corrida: 24 de septiembre de 2026.

Commit evaluado: `4bb8ef6` de `main`. La rama que publica este documento no modifica código de
aplicación: solo agrega documentación y una medición de cobertura.

Ejecución en GitHub Actions: [run 35610631280, verde](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/35610631280).

## Resultado de cada suite

| Suite | Comando | Resultado |
| --- | --- | --- |
| Unitarias del backend | `npm test` | 13 archivos, **102 pruebas aprobadas** |
| Integración con MySQL | `npm run test:integration` | **22 pruebas aprobadas** |
| Cobertura del backend | `npm run test:coverage` | 30,79 % de sentencias, 24,58 % de ramas, 37,26 % de funciones, 30,75 % de líneas (umbral: 30 %) |
| Unitarias del frontend | `cd frontend && npm test` | 19 archivos, **71 pruebas aprobadas** |
| Cobertura del frontend | `cd frontend && npm run test:coverage` | 45,79 % de sentencias, 42,20 % de ramas, 36,21 % de funciones, 47,39 % de líneas (umbral: 47 %) |
| Cobertura de la integración | `npm run test:coverage:integration` | 71,96 % de sentencias, 70,59 % de ramas, 69,03 % de funciones, 71,96 % de líneas sobre 56 archivos (umbral: 70 %) |
| Compilación y lint | `npm run build` y `cd frontend && npm run build && npm run lint` | Sin errores ni advertencias |
| Recorridos de navegador | `npm run test:e2e` | **9 recorridos aprobados** en Chromium |

## Qué cubre cada suite

**Unitarias del backend** (`src/tests`): servicios, controladores, validadores y esquemas. Incluye
usuarios, autenticación con contraseñas hasheadas, clases, tiendas, personajes, objetos —incluido el
atributo de objeto único—, reglas de venta y el servicio de juego.

**Integración con MySQL** (`src/integration/juego.test.ts`): registro y hash, login con cookie,
recuperación de sesión y logout, permisos por rol, perfiles y borrados con dependencias, partidas
públicas y privadas, creación de personaje con inventario, compra y venta con rollback real,
operaciones concurrentes, sesiones, misiones, recompensas y karma.

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
  recorre el sistema completo contra MySQL y alcanza el 71,96 % de líneas. Su umbral es 70 %.
- Las unitarias del frontend cubren componentes y servicios con jsdom; su umbral es 47 % de líneas.

Los porcentajes no se suman entre sí porque miden universos distintos. Los umbrales funcionan como
freno contra regresiones: si una suite pierde cobertura, la integración continua falla.

La integración continua ejecuta las tres mediciones —cobertura del backend, cobertura de la
integración y cobertura del frontend— y sube los informes como artefactos `cobertura-backend` y
`cobertura-frontend`. Si cualquiera baja del umbral, el trabajo queda en rojo y el PR no se fusiona.

## Verificación de los umbrales

Se comprobó que los umbrales se evalúan de verdad: ejecutar la suite de integración con `--lines 99`
termina con error y con el mensaje real de `c8`:

```text
ERROR: Coverage for lines (71.96%) does not meet global threshold (99%)
```

## Cómo reproducirlo

Requiere MySQL 8 y un usuario con permiso para crear y eliminar bases de prueba. Las suites de
integración y de navegador crean su propia base temporal y nunca usan `DB_NAME`.

```powershell
npm ci
npm --prefix frontend ci
$env:TEST_DB_HOST = '127.0.0.1'
$env:TEST_DB_PORT = '3306'
$env:TEST_DB_USER = 'usuario_de_pruebas'
$env:TEST_DB_PASSWORD = 'completar_localmente'

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
