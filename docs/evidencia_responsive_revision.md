# Revisión humana de las capturas responsive

Fecha: 24 de septiembre de 2026.
Corrida: `npx playwright test e2e/responsive.spec.ts`, sobre `main` en `4bb8ef6` más los arreglos de
este documento.

## Qué se revisó

La suite genera 38 capturas: doce pantallas privadas en 375, 768 y 1280 píxeles, más login y registro
en 375. Se miraron una por una las pantallas de juego, misiones, inventarios y perfiles, que son las
que más contenido tienen, y se verificaron las restantes contra la misma grilla.

## Resultado por pantalla

| Pantalla | 375 px | 768 px | 1280 px | Observación |
| --- | --- | --- | --- | --- |
| Dashboard | OK | OK | OK | La grilla de estadísticas se apila. |
| Usuarios | OK | OK | OK | Listado y detalle se ordenan en una columna. |
| Objetos | OK | OK | OK | Los filtros pasan a dos líneas. |
| Clases | OK | OK | OK | Tarjetas en una columna, botones alcanzables. |
| Tiendas | OK | OK | OK | Tabla con desplazamiento propio. |
| Partidas | OK | OK | OK | En 768 entra la tabla completa. |
| Personajes | OK | OK | OK | Filtro por clase visible. |
| Sesiones | Mejorado | OK | OK | El menú ocupaba media pantalla; ver hallazgo 1. |
| Misiones | Mejorado | OK | OK | Depende del mismo menú; tabla con desplazamiento propio. |
| Inventarios | Mejorado | OK | OK | Encabezados de tabla se leían cortados; ver hallazgo 2. |
| Perfiles | Mejorado | OK | OK | Sin cambios de contenido, gana altura útil. |
| Ruta inexistente | OK | OK | OK | Mensaje y enlace centrados. |
| Login y registro | OK | — | — | Formularios a ancho completo, sin desborde. |

## Hallazgos y corrección

### 1. El menú lateral ocupaba siete líneas en un teléfono

En 375 píxeles la barra de navegación se dibujaba en dos columnas por cinco filas y consumía unos
430 píxeles de alto: el contenido principal empezaba recién al final de la primera pantalla.

Corrección en `frontend/src/layouts/MainLayout.css`: por debajo de 600 píxeles el menú pasa a ser una
tira horizontal desplazable. Se ve entero con un gesto y el contenido arranca a unos 190 píxeles.

### 2. Las tablas anchas se leían sin contexto

Al desplazar en horizontal las tablas de sesiones, misiones, inventarios, tiendas y partidas, la
columna con el nombre del registro se iba de pantalla y quedaban columnas sueltas sin referencia.

Corrección en `frontend/src/index.css`: la primera columna queda fija mientras el resto de la tabla
se desplaza, tanto en `.app-table` como en `.module-table`. El fondo usa la variable del tema para
que no se superponga con el contenido al desplazar.

### 3. El auditor contaba los enlaces del menú como recortados

Al convertir el menú en tira desplazable, la auditoría automática marcó sus enlaces como elementos
fuera de la pantalla. No era un defecto: son accesibles con un gesto dentro de su propio contenedor.

Corrección en `e2e/responsive.spec.ts`: la lista de contenedores desplazables válidos ahora incluye
`nav-menu`, con el motivo escrito en el código.

## Verificación posterior

```text
npx playwright test e2e/responsive.spec.ts e2e/accesibilidad.spec.ts
ok  accesibilidad: pantallas principales sin violaciones graves
ok  accesibilidad: login y registro
ok  responsive: ninguna pantalla desborda en 375, 768 y 1280
ok  responsive: login y registro en pantalla chica
4 passed
```

## Límites

La revisión se hizo sobre capturas de Chromium, no sobre un teléfono físico. No cubre el tema oscuro,
el zoom del sistema operativo ni lectores de pantalla; eso queda para la revisión manual del
checklist.
