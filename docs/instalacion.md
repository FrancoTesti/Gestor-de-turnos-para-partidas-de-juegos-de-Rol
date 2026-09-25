# Instalación y actualización

## Requisitos

- Node compatible con Vite instalado: `^20.19.0 || >=22.12.0`.
- npm y MySQL 8 en ejecución.
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

### Instalar MySQL en Windows

Si la máquina todavía no tiene el servidor (no alcanza con MySQL Workbench, que es solo la interfaz
gráfica), instalarlo antes de seguir:

1. Descargar **MySQL Installer** desde el sitio oficial: <https://dev.mysql.com/downloads/installer/>.
   Elegir el MSI grande (unos 450 MB), no el `web-community`. Debajo del botón hay un enlace
   «No thanks, just start my download» para saltear la cuenta de Oracle.
2. La instalación **pide permisos de administrador** de Windows. Sin esa contraseña no se puede
   completar; en ese caso queda la alternativa de usar el MySQL de otra máquina y apuntar `DB_HOST`
   a su dirección.
3. Si antes hubo otro MySQL en la máquina, puede quedar una carpeta de datos en
   `C:\ProgramData\MySQL\MySQL Server 8.0`. Si el instalador se queja de que ya existe,
   **renombrarla** (por ejemplo a `MySQL Server 8.0.old`) en lugar de borrarla.
4. En el asistente: tipo de instalación **Server only**, puerto **3306**, «Use Strong Password
   Encryption» y servicio de Windows activado. **Anotar la contraseña de root**: no se puede
   recuperar y se necesita para el `.env`.
5. Comprobar que quedó escuchando:

```powershell
Get-Service MySQL* | Select-Object Name, Status
Test-NetConnection 127.0.0.1 -Port 3306
```

El servidor escucha solo en `127.0.0.1`: no queda expuesto a la red. La base de este proyecto es
descartable y se puede recrear en cualquier momento.

### Configurar la conexión

Copiar `.env.example` a `.env` y completar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `PORT`. No subir `.env` al repositorio.

Para una instalación nueva, crear una base vacía en MySQL, por ejemplo:

```sql
CREATE DATABASE rpg_desarrollo CHARACTER SET utf8mb4;
```

Configurar `DB_NAME=rpg_desarrollo` y un usuario con permisos sobre esa base. Desde la raíz:

```sh
npm run schema:create
```

Usar ese comando únicamente en una base nueva y vacía. Si ya hay datos, conservarlos: esta actualización no necesita recrear tablas. `SQL/rpg.sql` es una alternativa histórica que contiene estructura y datos de ejemplo; no ejecutarlo además de `schema:create` ni sobre una base existente.

El catálogo puede cargarse desde la interfaz con una cuenta de anfitrión. Las cuentas nuevas se crean desde Registro.

## Actualizar contraseñas antiguas

Las contraseñas nuevas de usuarios y partidas privadas se guardan con scrypt y sal aleatoria, no como texto. Los usuarios antiguos no pueden iniciar sesión hasta migrarlos; las claves antiguas de partidas privadas también requieren la migración.

1. Hacer una copia de seguridad de la base.
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

Para Live Share, el anfitrión ejecuta ambos procesos y comparte el servidor de Vite. Los invitados deben usar ese mismo frontend y su proxy `/api`, no conectar a su propio `localhost:3000`. Si la URL compartida cambia el origen, el anfitrión debe ajustar `CORS_ORIGIN` y reiniciar el backend.

## Pruebas

Backend: `npm run build` y `npm test`. Frontend: `npm run build`, `npm run lint` y `npm test` desde `frontend/`.

Las pruebas de integración usan MySQL real y necesitan un usuario de pruebas con permiso para crear y eliminar bases. No usan `DB_NAME`, `DB_USER` ni `DB_PASSWORD` de desarrollo. Ejemplo en PowerShell, contra un MySQL local de pruebas:

```powershell
$env:TEST_DB_HOST = '127.0.0.1'
$env:TEST_DB_PORT = '3306'
$env:TEST_DB_USER = 'usuario_pruebas'
$env:TEST_DB_PASSWORD = 'completar_localmente'
npm run test:integration
```

El comando genera un nombre `rpg_test_<aleatorio>`, crea la base, ejecuta los casos y elimina solo esa base. No limpia ninguna base preexistente. Si el proceso es interrumpido abruptamente puede quedar una base temporal; identificarla antes de eliminarla manualmente. Para aislamiento máximo, ejecutar las pruebas en otra instancia de MySQL.

### Cobertura

Cada suite mide su propia cobertura, porque miden cosas distintas:

```sh
npm run test:coverage              # unitarias del backend (Vitest)
cd frontend && npm run test:coverage   # unitarias del frontend
cd .. && npm run test:coverage:integration   # integración contra MySQL (c8)
```

`test:coverage:integration` compila, ejecuta la suite de integración instrumentada con `c8` y falla
si la cobertura baja de los umbrales declarados en `package.json`. Los informes quedan en
`coverage/`, que no se versiona. Para verlos en detalle: `coverage/index.html` y
`coverage/integracion/index.html`.

### Pruebas de navegador (E2E)

Los recorridos de navegador usan Playwright con Chromium y necesitan el backend compilado, MySQL y un usuario de pruebas. Desde la raíz:

```powershell
npm ci
npm --prefix frontend ci
npx playwright install chromium
$env:TEST_DB_HOST = '127.0.0.1'
$env:TEST_DB_PORT = '3306'
$env:TEST_DB_USER = 'usuario_pruebas'
$env:TEST_DB_PASSWORD = 'completar_localmente'
npm run test:e2e
```

La suite crea una base `rpg_e2e_<aleatorio>`, levanta Express en el puerto 3101 y Vite en el 5174, ejecuta los recorridos y elimina únicamente su propia base. Nunca usa `DB_NAME`. Si los puertos 3101 o 5174 están ocupados, el preparador falla antes de ejecutar los casos. Las capturas y trazas de los fallos quedan en `test-results/`, que no se versiona. El detalle de cada recorrido y sus límites está en [entrega.md](entrega.md).

## Sesiones y despliegue

Las sesiones duran ocho horas y usan cookies HttpOnly y SameSite=Strict. La recarga del navegador conserva el ingreso; cerrar sesión, cambiar la contraseña o reiniciar el backend lo invalida. Los tokens se guardan solo en memoria del servidor: un despliegue con varias instancias necesitará un almacén de sesiones compartido.

En producción usar HTTPS, `NODE_ENV=production` (cookie Secure), un origen explícito y un proxy que sirva frontend y `/api` bajo el mismo sitio. `npm run build` genera el backend; `npm start` lo ejecuta. El frontend se compila aparte y necesita fallback a `index.html` para las rutas de React.

## Problemas frecuentes

- `ECONNREFUSED 127.0.0.1:3306` al ejecutar `npm run dev`: no hay ningún MySQL escuchando. Revisar
  que el servicio esté iniciado (`Get-Service MySQL*`) y que exista el archivo `.env`; sin `.env` la
  configuración cae a `127.0.0.1`, usuario `root` y base `hola`, aunque la base esté en otra máquina.
- `Error HTTP 502` en el navegador: el frontend está levantado pero el backend no. Iniciar `npm run dev`
  en la raíz; la pantalla avisa que el servidor no responde.
- Error de conexión: comprobar que MySQL esté iniciado y que puerto/credenciales sean correctos.
- Login rechazado con cuentas antiguas: revisar la migración, no borrar usuarios ni desactivar la autenticación.
- `401`: la sesión falta o expiró. Volver a ingresar.
- `403`: operación ajena, rol insuficiente u origen incorrecto.
- `409` al borrar: el registro tiene relaciones o historial que deben conservarse.
- No aparecen cambios compartidos: verificar que los archivos estén guardados en la PC anfitriona; Live Share no guarda automáticamente el repositorio en las PCs invitadas.
