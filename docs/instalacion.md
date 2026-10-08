# Instalación y actualización

## Requisitos

- Node compatible con Vite instalado: `^20.19.0 || >=22.12.0`.
- npm.
- Una cuenta gratuita en [Supabase](https://supabase.com), que aloja la base PostgreSQL. No hace falta
  instalar ninguna base de datos en la máquina.
- Dos terminales: una en la raíz del repositorio y otra en `frontend/`.

## Dependencias

Desde la raíz:

```sh
npm ci
cd frontend
npm ci
cd ..
```

`npm ci` instala las versiones de los archivos de bloqueo. No hay una carpeta `backend`: el backend está en la raíz.

## Base de datos

La aplicación usa PostgreSQL alojado en Supabase, un servicio independiente con persistencia en disco,
al que se accede mediante MikroORM.

### Crear el proyecto en Supabase

1. Crear una cuenta en <https://supabase.com> y un proyecto nuevo. Al crearlo hay que elegir una
   **contraseña de la base de datos**: conviene que tenga solo letras y números, porque va dentro de
   una URL y símbolos como `@ : / # ? %` la rompen. Si se pierde, se restablece en
   *Project Settings → Database*.
2. Elegir la región más cercana a donde correrá el backend: cada consulta viaja por red, y una región
   lejana se nota en los tiempos de respuesta.
3. Abrir **Connect**, entrar en la pestaña **Direct** (*Connection string*) y, en *Method*, elegir
   **Session pooler** (puerto 5432). La conexión directa de Supabase es solo IPv6 y falla en muchas
   redes; el Session pooler funciona por IPv4.
4. Copiar la cadena, que se ve así, y reemplazar `[YOUR-PASSWORD]` por la contraseña, sin los corchetes:

```text
postgresql://postgres.<codigo-del-proyecto>:<contraseña>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

### Configurar la conexión

Copiar `.env.example` a `.env` y completar `SUPABASE_DB_URL` con esa cadena (una sola línea, sin comillas
ni espacios alrededor del `=`). No subir `.env` al repositorio. Para comprobar que la conexión es válida:

```sh
npm run db:probar
```

El script se conecta, crea y revierte un esquema temporal con una tabla, prueba `SELECT ... FOR UPDATE` y
nunca imprime la contraseña.

### Crear las tablas

En un proyecto nuevo y vacío, desde la raíz:

```sh
npm run schema:create
npm run db:rls
```

- `schema:create` crea las 12 tablas a partir de las entidades. Usarlo únicamente en una base nueva y
  vacía: si ya hay datos, conservarlos.
- `db:rls` activa Row Level Security en todas las tablas, sin políticas. Supabase expone el esquema `public`
  por una API REST con una clave pública; sin RLS, cualquiera con esa clave podría leer tablas como
  `usuarios`. El backend se conecta como dueño de las tablas y no se ve afectado. Es idempotente y hay
  que volver a ejecutarlo si se recrean las tablas.

`SQL/rpg.sql` es la versión histórica del esquema en sintaxis MySQL: no sirve para PostgreSQL y no hay que
ejecutarla. La fuente de verdad del esquema son las entidades de `src/entities/`.

El catálogo puede cargarse desde la interfaz con una cuenta de anfitrión, o bien mediante el script de datos de demostración. Las cuentas nuevas también se pueden crear desde Registro.

### Datos iniciales de demostración y prueba

Para poblar la base recién creada con cuentas y catálogo inicial de prueba:
1. Iniciar el backend con `npm run dev`.
2. En otra terminal en la raíz, ejecutar:

```sh
npm run demo:datos
```

Este script crea los usuarios `dm_demo` (anfitrión) y `jugador_demo` (jugador) con contraseña `PruebaSegura123`, además de dos clases, dos tiendas y objetos de catálogo. Es idempotente: si los datos ya existen, no los duplica. Ver [demo.md](demo.md#datos-de-demostración) para más detalles.

## Actualizar contraseñas antiguas

Las contraseñas nuevas de usuarios y partidas privadas se guardan con scrypt y sal aleatoria, no como texto. Los usuarios antiguos no pueden iniciar sesión hasta migrarlos; las claves antiguas de partidas privadas también requieren la migración.

1. Hacer una copia de seguridad de la base (ver [respaldo.md](respaldo.md)).
2. Detener el backend y confirmar que `.env` apunta a la base correcta.
3. Revisar sin modificar datos:

```sh
npm run passwords:migrate
```

4. Aplicar la migración explícitamente:

```sh
npm run passwords:migrate -- --apply
```

Conserva las mismas contraseñas para usuarios y partidas privadas, pero reemplaza su almacenamiento por hashes. Se puede repetir: omite los hashes ya migrados. No imprime contraseñas y no cambia el tamaño de la columna. No se ejecuta automáticamente al arrancar la aplicación.

## Arrancar

Terminal 1, raíz:

```sh
npm run dev
```

Terminal 2, `frontend/`:

```sh
npm run dev
```

Abrir `http://localhost:5173`. Vite reenvía `/api` al backend en el puerto 3000. Si cambian ese puerto, actualizar el destino en `frontend/vite.config.ts`. El origen permitido por defecto es `http://localhost:5173`; si usan otra dirección, configurar `CORS_ORIGIN` exactamente igual (incluido el puerto).

### Todo desde un solo servidor

El backend también sirve el frontend compilado, de modo que la aplicación completa queda en un único
origen, como en una publicación real:

```sh
npm run build
npm --prefix frontend run build
npm start
```

Abrir `http://localhost:3000`. El servidor acepta las peticiones que llegan desde su propio origen, así que
en este modo no hace falta tocar `CORS_ORIGIN`.

Para Live Share, el anfitrión ejecuta ambos procesos y comparte el servidor de Vite. Los invitados deben usar ese mismo frontend y su proxy `/api`, no conectar a su propio `localhost:3000`. Si la URL compartida cambia el origen, el anfitrión debe ajustar `CORS_ORIGIN` y reiniciar el backend.

## Pruebas

Backend: `npm run build` y `npm test`. Frontend: `npm run build`, `npm run lint` y `npm test` desde `frontend/`.

Las pruebas de integración usan PostgreSQL real. Reciben la conexión en `TEST_DB_URL` (puede ser la misma
URL de `SUPABASE_DB_URL`) y **nunca tocan el esquema `public`**: cada ejecución crea un esquema
`rpg_test_<aleatorio>` dentro de esa base, corre los casos y elimina solo ese esquema. Si `TEST_DB_URL` no
está definida, la suite falla antes de tocar nada. Ejemplo en PowerShell:

```powershell
$env:TEST_DB_URL = 'postgresql://postgres.<codigo>:<contraseña>@aws-0-<region>.pooler.supabase.com:5432/postgres'
npm run test:integration
```

Si el proceso se interrumpe abruptamente puede quedar un esquema temporal; identificarlo (`rpg_test_*` o
`rpg_e2e_*`) antes de eliminarlo manualmente. Contra un PostgreSQL local o de integración continua, que no
tiene SSL, agregar `DB_SSL=false`.

### Cobertura

Cada suite mide su propia cobertura, porque miden cosas distintas:

```sh
npm run test:coverage              # unitarias del backend (Vitest)
cd frontend && npm run test:coverage   # unitarias del frontend
cd .. && npm run test:coverage:integration   # integración contra PostgreSQL (c8)
```

`test:coverage:integration` compila, ejecuta la suite de integración instrumentada con `c8` y falla
si la cobertura baja de los umbrales declarados en `package.json`. Los informes quedan en
`coverage/`, que no se versiona. Para verlos en detalle: `coverage/index.html` y
`coverage/integracion/index.html`.

### Pruebas de navegador (E2E)

Los recorridos de navegador usan Playwright con Chromium y necesitan el backend compilado y `TEST_DB_URL`. Desde la raíz:

```powershell
npm ci
npm --prefix frontend ci
npx playwright install chromium
$env:TEST_DB_URL = 'postgresql://postgres.<codigo>:<contraseña>@aws-0-<region>.pooler.supabase.com:5432/postgres'
npm run test:e2e
```

La suite crea un esquema `rpg_e2e_<aleatorio>`, levanta Express en el puerto 3101 y Vite en el 5174, ejecuta los recorridos y elimina únicamente su propio esquema. Nunca toca `public`. Si los puertos 3101 o 5174 están ocupados, el preparador falla antes de ejecutar los casos. Las capturas y trazas de los fallos quedan en `test-results/`, que no se versiona. El detalle de cada recorrido y sus límites está en [entrega.md](entrega.md).

Cada consulta a una base remota tarda decenas o cientos de milisegundos, y los recorridos largos (juego
completo con dos cuentas, auditoría de accesibilidad) pueden superar el límite de 60 s por prueba. Contra
Supabase desde otro continente, ampliarlo con `E2E_TIMEOUT_MS`:

```powershell
$env:E2E_TIMEOUT_MS = '240000'
npm run test:e2e
```

## Sesiones y despliegue

Las sesiones duran ocho horas y usan cookies HttpOnly y SameSite=Strict. La recarga del navegador conserva el ingreso; cerrar sesión, cambiar la contraseña o reiniciar el backend lo invalida. Los tokens se guardan solo en memoria del servidor: un despliegue con varias instancias necesitará un almacén de sesiones compartido.

En producción usar HTTPS, `NODE_ENV=production` (cookie Secure y `trust proxy`) y un único servicio que sirva el frontend y `/api` bajo el mismo sitio: `npm start` ya lo hace si existe `frontend/dist`. Ver [despliegue.md](despliegue.md).

## Problemas frecuentes

- `SUPABASE_DB_URL` ausente: sin esa variable el backend no tiene a qué conectarse. Revisar que exista el archivo `.env` en la raíz y que la línea no tenga comillas ni espacios alrededor del `=`.
- `28P01 password authentication failed`: la contraseña de la URL no coincide con la de la base. Si tiene `@ : / # ? %`, restablecerla por una solo alfanumérica en *Project Settings → Database* y actualizar el `.env`.
- `ENOTFOUND db.<codigo>.supabase.co` o `ENETUNREACH`: se está usando la conexión directa, que es solo IPv6. Usar la cadena del **Session pooler** (puerto 5432).
- `The server does not support SSL connections`: es un PostgreSQL sin SSL (local o de integración continua). Definir `DB_SSL=false`.
- `Error HTTP 502` en el navegador: el frontend está levantado pero el backend no. Iniciar `npm run dev`
  en la raíz; la pantalla avisa que el servidor no responde.
- Las pantallas tardan en cargar: cada consulta viaja a la región de Supabase. Elegir una región cercana al backend; ver [despliegue.md](despliegue.md).
- Login rechazado con cuentas antiguas: revisar la migración, no borrar usuarios ni desactivar la autenticación.
- `401`: la sesión falta o expiró. Volver a ingresar.
- `403`: operación ajena, rol insuficiente u origen incorrecto (un origen distinto del servidor y de `CORS_ORIGIN`).
- `409` al borrar: el registro tiene relaciones o historial que deben conservarse.
- No aparecen cambios compartidos: verificar que los archivos estén guardados en la PC anfitriona; Live Share no guarda automáticamente el repositorio en las PCs invitadas.
