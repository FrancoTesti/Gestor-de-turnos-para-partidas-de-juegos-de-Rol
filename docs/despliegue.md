# Despliegue y variables de entorno

La base de datos ya es un servicio independiente (PostgreSQL en Supabase). El backend, además, sirve el
frontend compilado, de modo que toda la aplicación puede publicarse como **un único servicio web**.
Esta página documenta qué configuración necesita, **sin incluir ningún valor real**: las credenciales se
cargan en el `.env` de cada máquina o en el panel del proveedor, nunca en el repositorio.

> Estado: la aplicación corre completa con `npm start` contra Supabase (ver
> [instalacion.md](instalacion.md#todo-desde-un-solo-servidor)). **Todavía no se publicó en ningún
> proveedor de hosting**: los pasos de más abajo están previstos, no ejecutados.

## Variables

Todas se leen en el backend con `dotenv`. `.env.example` es la plantilla; copiarlo a `.env` y completarlo.

| Variable | Obligatoria | Valor por defecto | Para qué sirve |
| --- | --- | --- | --- |
| `SUPABASE_DB_URL` | sí | — | Cadena de conexión PostgreSQL (Session pooler de Supabase, puerto 5432) con usuario, contraseña, host y base |
| `PORT` | no | `3000` | Puerto de la API |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Origen del frontend autorizado cuando corre aparte (Vite). El origen propio del servidor siempre se acepta |
| `NODE_ENV` | en producción | — | Con `production` la cookie de sesión se marca `Secure` y se confía en el proxy del proveedor (`trust proxy`) |
| `DB_SSL` | no | activo | `false` desactiva TLS para un PostgreSQL local o de integración continua, que no lo tiene. Supabase exige TLS |
| `DB_DEBUG` | no | `false` | Registra las consultas; dejar en `false` salvo diagnóstico local |

Solo para pruebas y scripts (nunca en producción):

| Variable | Para qué sirve |
| --- | --- |
| `TEST_DB_URL` | Base para las pruebas de integración y E2E. Cada ejecución crea y elimina un esquema temporal; nunca toca `public`. Puede ser la misma URL que `SUPABASE_DB_URL` |
| `DB_SCHEMA` | Hace que la aplicación o un script trabaje en un esquema distinto de `public`. Lo usan las pruebas |
| `E2E_TIMEOUT_MS` | Límite por prueba de Playwright (60000 por defecto); contra una base remota conviene ampliarlo |

El frontend no necesita variables: en desarrollo el proxy de Vite manda `/api` al backend
(`API_PROXY_TARGET` lo cambia si hace falta) y en producción ambos se sirven bajo el mismo dominio.

## Qué hay que resolver antes de publicarlo

1. **Sesiones en memoria.** `src/security/auth.ts` guarda los tokens en un `Map` del proceso. Con
   más de una instancia o con reinicios, las sesiones se pierden. Para publicarlo habría que mover
   ese almacén a Redis o a una tabla, o fijar una sola instancia y asumir el corte en cada deploy. Los
   planes gratuitos de hosting suelen suspender el servicio tras un rato sin uso, lo que equivale a un
   reinicio.
2. **HTTPS.** La cookie se marca `Secure` con `NODE_ENV=production`; sin HTTPS el navegador la
   descarta y nadie puede iniciar sesión.
3. **Mismo sitio para frontend y API.** La cookie es `SameSite=Strict`, así que ambos deben servirse
   desde el mismo dominio. Ya está resuelto: si existe `frontend/dist`, `npm start` lo sirve con
   *fallback* a `index.html` para las rutas de React, y la API queda bajo `/api`.
4. **Región.** Cada consulta viaja hasta la base. Medido desde otro continente: ~190 ms por consulta y
   ~1,1 s para abrir una conexión nueva. Publicar el backend en una región cercana a la de Supabase
   baja esos tiempos de forma drástica; el navegador pasa a hacer un solo viaje por acción.
5. **Seguridad de la base.** Supabase expone `public` por una API REST con una clave pública: las tablas
   deben tener RLS activada y sin políticas (`npm run db:rls`). El backend se conecta como dueño de las
   tablas y la ignora.
6. **Base de datos.** Crear las tablas una sola vez con `npm run schema:create` y `npm run db:rls` antes
   del primer arranque, y `npm run passwords:migrate` si se importan usuarios viejos con contraseñas en
   texto plano.

## Pasos de un despliegue manual

```bash
# Compilación (backend y frontend)
npm ci
npm run build          # genera dist/
npm --prefix frontend ci
npm --prefix frontend run build   # genera frontend/dist/, que sirve el propio backend

# Arranque
NODE_ENV=production npm start
```

En un proveedor de hosting, esos mismos comandos van como *build command* (`npm ci && npm run build &&
npm --prefix frontend ci && npm --prefix frontend run build`) y *start command* (`npm start`). Las
variables se cargan en el panel del proveedor.

## Qué nunca se sube

- `.env` y cualquier archivo con credenciales (ya está en `.gitignore`).
- Volcados de la base con datos reales.
- `node_modules/`, `dist/`, `test-results/` y demás generados.
