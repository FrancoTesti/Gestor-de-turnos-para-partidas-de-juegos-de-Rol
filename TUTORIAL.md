# Tutorial para el equipo

Esta es la guía rápida para usar el proyecto. El detalle completo del despliegue está en
[docs/despliegue.md](docs/despliegue.md) y el índice de toda la documentación, en
[docs/README.md](docs/README.md).

## 1. Qué cambió

- **Todo está en un deploy.** La aplicación (API y frontend) está publicada en **Render** como un único
  servicio web. **No hace falta instalar nada** para usarla.
- La base de datos pasó de **MySQL local** a **PostgreSQL en Supabase** (un servicio en la nube), y el
  deploy ya está conectado a ella.
- `main` ya incluye todo esto (PR #54).

## 2. Cómo usar la aplicación

1. Entrá al link del deploy:
   **[https://gestor-de-turnos-para-partidas-de-juegos.onrender.com/dashboard](https://gestor-de-turnos-para-partidas-de-juegos.onrender.com/dashboard)**
2. Iniciá sesión. Podés usar las cuentas de demostración (contraseña `PruebaSegura123`):
   - `dm_demo`: anfitrión.
   - `jugador_demo`: jugador.

   O registrá un usuario propio con tu nombre.

Si la página tarda en cargar la primera vez, esperá unos segundos: el servicio puede estar "despertando"
después de un rato sin uso.

**Video de demostración:**
[ver en Drive](https://drive.google.com/file/d/1YZ-nJKHwbZkN9zQgqnM9axlBkd7jfSew/view?usp=sharing)

### La base es compartida

Todos usan la misma base de Supabase, así que:

- No cambien la contraseña de `dm_demo` ni de `jugador_demo`: dejaría afuera a los demás.
- No borren datos que no crearon ustedes. Para probar cosas propias, registren usuarios con su nombre.

## 3. Qué hace el deploy por detrás

No hay que ejecutar nada a mano: Render ya tiene el repositorio conectado y corre los comandos de
inicialización cada vez que se publica una versión.

| Etapa | Comando | Qué hace |
| --- | --- | --- |
| Build | `npm ci --include=dev && npm run build:all` | Instala las dependencias exactas del `package-lock.json` (incluidas las de desarrollo, necesarias para compilar), compila el backend de TypeScript a `dist/` y compila el frontend de React (Vite) a `frontend/dist/` |
| Arranque | `npm start` | Ejecuta `node dist/app.js`: levanta la API bajo `/api` y sirve el frontend compilado bajo `/`, desde el mismo dominio |

Las variables de entorno (`NODE_ENV`, `PORT`, `SUPABASE_DB_URL`, `DB_SSL`) se cargan en el panel de
Render, nunca en el repositorio. Ver [docs/despliegue.md](docs/despliegue.md).

## 4. Desarrollo local (opcional)

Esta parte solo hace falta si vas a modificar el código. Para usar la aplicación alcanza con el link de
la sección 2.

Hacer todo desde la **carpeta base del proyecto** (la que tiene el `package.json` del backend).

**a) Traer `main` y reinstalar dependencias**

```bash
git switch main
```

```bash
git pull
```

```bash
npm ci
```

`npm ci` es obligatorio: las dependencias instaladas son las de MySQL y el código ahora pide las de
PostgreSQL. Si no lo hacés, vas a ver `Cannot find module '@mikro-orm/mysql'` o un error parecido.
En `frontend/` solo hace falta `npm ci` si cambió `frontend/package.json`.

**b) Completar el `.env`**

1. Si no tenés `.env`, copiá la plantilla `.env.example` y renombrala a `.env`.
2. Agregá la línea `SUPABASE_DB_URL=...` con la cadena de conexión de la base compartida del equipo.
   **Pedísela por mensaje privado a Emanuel.** Nunca la pegues en el repositorio, en un issue, en un
   PR ni en capturas de pantalla: lleva la contraseña de la base.
3. Sin comillas y sin espacios alrededor del `=`.

**c) Comprobar que la conexión funciona**

```bash
npm run db:probar
```

Tiene que terminar con `RESULTADO: conexión válida.`

> **Alternativa:** si preferís tu propia base, creá un proyecto gratuito en Supabase, copiá la cadena
> del *Session pooler* (puerto 5432) y seguí [docs/instalacion.md](docs/instalacion.md) para crear las
> tablas (`npm run schema:create` y `npm run db:rls`). Ahí los datos son solo tuyos.

**d) Correr el proyecto**

Se necesitan **dos terminales**: una para el backend y otra para el frontend.

Terminal 1, en la carpeta base:

```bash
npm run dev
```

Terminal 2, dentro de `frontend/`:

```bash
npm run dev
```

Abrí **http://localhost:5173** en el navegador, con ese puerto exacto: el backend solo acepta
peticiones que vengan de ahí. Si la base está vacía, con el backend corriendo se cargan las cuentas
de demostración con `npm run demo:datos`.

## 5. Antes de subir cambios

Lo que cambie el frontend tiene que pasar esto **antes** de hacer push (el CI lo vuelve a correr y
bloquea el merge si falla):

```bash
cd frontend
npm run lint
npm test
npm run build
```

Para el backend, desde la carpeta base:

```bash
npm run build
npm test
```

- **Los cambios hechos con una herramienta de IA (Antigravity, Copilot, etc.) también se verifican.**
  Un commit de este tipo dejó `main` en rojo: falló el lint (un `useState` mal ubicado) y fallaron los E2E.
- Las pruebas de integración y los E2E necesitan `TEST_DB_URL` y crean un esquema temporal (nunca
  tocan los datos reales). Contra Supabase desde otro continente son lentos: usen
  `E2E_TIMEOUT_MS=240000`. Ver [docs/evidencia_tests.md](docs/evidencia_tests.md).

## 6. Cómo trabajar con Git

1. **Nunca pushear directo a `main`.** Siempre una rama nueva y un Pull Request.
2. **Esperar los tres checks en verde** (backend, frontend, documentación) antes de mergear.
3. **No usar `git push --force`** sobre ramas compartidas.
4. **No revertir el trabajo de otra persona sin acordarlo.** Si hay que deshacer algo: guardar el
   trabajo en una rama (`git branch nombre <commit>`), revertir con `git revert` por PR y avisar.
5. **Cambiar de rama no cambia `node_modules`.** Si pasan entre ramas con dependencias distintas,
   corran `npm ci` en la carpeta base después de cambiar.

## 7. Frontend: lo que hay que retomar

Las mejoras visuales de layout, navbar, formularios, avatares y lightbox se revirtieron de `main`
porque rompían el lint y los E2E. **No se perdieron**: están en la rama
`franco/mejoras-visuales`. Para reincorporarlas:

1. Crear una rama desde esa y arreglar el lint (`UsuarioDetalle.tsx`) y los E2E.
2. Los E2E buscan textos concretos de la interfaz; revisar `e2e/helpers.ts` (placeholders
   «Nombre y apellido», «Nickname», «Contraseña», «Repetir contraseña»; etiqueta «Anfitrión»;
   botones «Registrar» e «Ingresar»). Si el rediseño los cambia, hay que actualizar esos tests.
3. Abrir un PR nuevo con los tres checks en verde.

## 8. Problemas frecuentes

| Qué ves | Qué significa | Qué hacer |
| --- | --- | --- |
| La página tarda mucho en abrir | El servicio de Render estaba suspendido por falta de uso | Esperar unos segundos y recargar |
| Te pide iniciar sesión de nuevo | Las sesiones se guardan en memoria del servidor y se pierden cuando se reinicia o se publica una versión nueva | Volver a iniciar sesión |
| `Cannot find module '@mikro-orm/mysql'` | Código de una rama con dependencias de otra | `npm ci` en la carpeta base |
| `28P01 password authentication failed` | La contraseña de `SUPABASE_DB_URL` no es correcta | Pedir la cadena otra vez; sin comillas ni espacios |
| `ENOTFOUND db.….supabase.co` | Se está usando la conexión directa (solo IPv6) | Usar la cadena del **Session pooler**, puerto 5432 |
| `Origen no permitido` (403) | Abriste el frontend en un puerto distinto de 5173 | Cerrar otros Vite y abrir exactamente `http://localhost:5173` |
| `No se pudo conectar con el servidor` | El frontend no llega al backend; suele ser que el backend no está corriendo o que quedó en otro puerto | Verificar que `http://localhost:3000/api/health` responda y que el `PORT` del `.env` sea 3000 |
| Puerto 3000 o 5173 en uso | Quedó un servidor viejo abierto | Cerrar la terminal anterior o el proceso que lo usa |
| `EBUSY ... frontend\dist\...` en nodemon | Algo estaba regenerando el frontend | `Ctrl+C` y volver a correr `npm run dev` |
| Tardan las pantallas | Cada consulta viaja a la región de la base | Normal desde otro continente; ver [docs/despliegue.md](docs/despliegue.md) |

## 9. Pendiente

- **Copia de seguridad:** [docs/respaldo.md](docs/respaldo.md) usa `pg_dump` y `psql` y **no se verificó**.
- **Datos de prueba** en la base compartida: hay que limpiarlos antes de grabar la demostración.
- **GitHub Actions con PostgreSQL:** quedó en verde en el PR #54.

## 10. Seguridad

- **Nunca subir el `.env`** ni ninguna cadena de conexión (ya está en `.gitignore`).
- Las tablas de Supabase tienen **Row Level Security** activada, porque Supabase expone el esquema
  `public` por una API REST. Si alguien vuelve a crear las tablas, tiene que correr `npm run db:rls`.
