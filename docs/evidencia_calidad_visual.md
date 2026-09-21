# Evidencia de revisión responsive y de accesibilidad

Fecha de la corrida: 21 de septiembre de 2026. Rama: `renzo/semana-17-23`.

## Cómo se ejecuta

Requiere MySQL y las variables `TEST_DB_*`, igual que el resto de los recorridos de navegador. Desde
la raíz del repositorio:

```powershell
npm ci
npm --prefix frontend ci
npx playwright install chromium
$env:TEST_DB_PORT = '3306'
npm run test:e2e -- e2e/responsive.spec.ts e2e/accesibilidad.spec.ts
```

Las capturas quedan en `test-results/`, que no se versiona. La integración continua las publica como
artefacto `evidencia-e2e` en cada ejecución.

## Qué se comprueba

`e2e/responsive.spec.ts` recorre doce pantallas privadas en 375, 768 y 1280 píxeles, más login y
registro en 375. Falla si el documento se desplaza en horizontal o si un elemento queda recortado
fuera de un contenedor previsto para tablas anchas (`.tabla-scroll`, `.module-table`,
`.table-wrapper`). Genera una captura completa por pantalla y por ancho.

`e2e/accesibilidad.spec.ts` analiza once pantallas privadas más login y registro con axe-core y las
reglas WCAG 2.0 A y AA. Falla ante cualquier violación de impacto `serious` o `critical`.

## Hallazgos y correcciones

| Hallazgo | Dónde | Corrección |
| --- | --- | --- |
| Grilla de estadísticas fija en tres columnas, desbordaba a 375 px | `DashboardPage.tsx` | `repeat(auto-fit, minmax(8rem, 1fr))` y contenedor con `width: 100%` y padding |
| Tablas anchas que arrastraban toda el área principal | `TiendasPage.tsx`, `SesionesPage.tsx`, `MisionesPage.tsx` | Contenedor propio `.tabla-scroll` por tabla |
| Columnas flex sin `min-width` que estiraban el formulario | `SesionesPage.tsx`, `MisionesPage.tsx` | `minWidth: 0` y estilos para `.app-table` y `.app-form` |
| `select` de tipos sin nombre accesible | `ObjetosPage.tsx` | `aria-label="Filtrar por tipo de objeto"` |
| Tarjeta de clase con `role="button"` y botones anidados | `ClaseLista.tsx` | La tarjeta deja de ser interactiva y se agrega el botón «Ver detalle» |
| Contraste insuficiente en acentos, encabezados, badges y botones | `index.css`, `App.css`, `clases.css`, `partidas.css`, `objetos.css`, `TiendasPage.tsx`, `SesionesPage.tsx` | Token `--accent-solid` y tonos más oscuros que superan 4.5:1 |
| Errores de guardado visibles solo en la consola del navegador | `PartidaFormulario.tsx` | Mensaje visible con `role="alert"` |
| Fallo al cargar clases, jugadores y partidas sin aviso | `PersonajeFormulario.tsx` | Mensaje visible en el formulario |

El texto de encabezado que usaba `#718096` se cambió a `#4a5568`, y el estado «Planificada» que
usaba `gray` pasó a `#4b5563`. Ambos superan el contraste mínimo exigido sobre fondo blanco.

## Resultado

- Responsive: 2 pruebas aprobadas y 38 capturas generadas (12 pantallas × 3 anchos + 2 públicas).
- Accesibilidad: 2 pruebas aprobadas, sin violaciones `serious` ni `critical`.
- Sin desplazamiento horizontal del documento en ninguna pantalla ni ancho.

## Límites

La auditoría automática no reemplaza la revisión manual: no evalúa el orden de tabulación completo,
el texto alternativo de imágenes generadas en tiempo de ejecución ni el uso con lector de pantalla.
Corre en tema claro; el tema oscuro queda para la revisión manual del checklist.
