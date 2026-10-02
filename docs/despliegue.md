# Despliegue y variables de entorno

## Decisión de entrega

**La entrega es local: el sistema no está desplegado en ningún servidor.** Se decidió así porque
publicarlo exigiría resolver antes las sesiones en memoria, el HTTPS y el proxy de un único dominio
(ver «Qué hay que resolver antes de publicarlo»), y eso es trabajo de infraestructura fuera del
alcance acordado. No hay URL pública ni credenciales de ningún servicio externo que la cátedra deba
conocer. Decisión registrada el 2 de octubre de 2026; si el grupo cambia de criterio, se corrige
acá y en `proposal.md`.

### Cómo lo levanta el corrector

Requisitos: Node `^20.19.0 || >=22.12.0`, npm y MySQL 8 en ejecución. El detalle y los problemas
frecuentes están en [instalacion.md](instalacion.md); el resumen es:

1. Clonar el repositorio y, en la raíz **y** en `frontend/`, ejecutar `npm ci` (son dos proyectos).
2. Crear una base vacía, por ejemplo `CREATE DATABASE rpg_desarrollo CHARACTER SET utf8mb4;`.
3. Copiar `.env.example` a `.env` y completar `DB_USER`, `DB_PASSWORD` y `DB_NAME` con **los datos
   de su propio MySQL**. Las credenciales de la base las pone quien corre el proyecto: el grupo no
   entrega ni comparte ninguna.
4. Desde la raíz, `npm run schema:create` (solo sobre la base vacía).
5. Terminal 1, raíz: `npm run dev`. Terminal 2, `frontend/`: `npm run dev`.
6. Abrir `http://localhost:5173`.

### Credenciales de demostración

Son cuentas de la aplicación (no de MySQL) y se crean en la base propia del corrector; no existen en
ningún otro lado. Con el backend corriendo, `npm run demo:datos` las crea junto con el catálogo:

| Cuenta | Rol | Contraseña |
| --- | --- | --- |
| `dm_demo` | Anfitrión | `PruebaSegura123` |
| `jugador_demo` | Jugador | `PruebaSegura123` |

Alternativamente se pueden registrar cuentas propias desde `/register`. Hacen falta **dos
navegadores o una ventana de incógnito** para usar los dos roles a la vez, porque la sesión es una
cookie por navegador. El recorrido completo está en [demo.md](demo.md). Reiniciar el backend cierra
todas las sesiones y obliga a volver a iniciar sesión.

## Si más adelante se publica

Esta sección documenta qué haría falta para publicarlo y qué configuración necesita, **sin incluir
ningún valor real**: las credenciales se cargan en el `.env` de cada máquina, que no se versiona.

## Variables

Todas se leen en el backend con `dotenv`. `.env.example` es la plantilla; copiarlo a `.env` y
completarlo.

| Variable | Obligatoria | Valor por defecto | Para qué sirve |
| --- | --- | --- | --- |
| `DB_HOST` | sí | `127.0.0.1` | Host de MySQL |
| `DB_PORT` | sí | `3306` | Puerto de MySQL |
| `DB_USER` | sí | — | Usuario de MySQL |
| `DB_PASSWORD` | sí | — | Contraseña de MySQL |
| `DB_NAME` | sí | `RPG` | Base de la aplicación |
| `DB_DEBUG` | no | `false` | Registra las consultas; dejar en `false` salvo diagnóstico local |
| `PORT` | no | `3000` | Puerto de la API |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Origen exacto del frontend autorizado |
| `NODE_ENV` | en producción | — | Con `production` la cookie de sesión se marca `Secure` |

Solo para las pruebas automáticas contra MySQL (base descartable, nunca la de la aplicación):
`TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USER`, `TEST_DB_PASSWORD`.

El frontend no necesita variables: en desarrollo el proxy de Vite manda `/api` al backend
(`API_PROXY_TARGET` lo cambia si hace falta) y en producción ambos se sirven bajo el mismo dominio.

## Qué hay que resolver antes de publicarlo

1. **Sesiones en memoria.** `src/security/auth.ts` guarda los tokens en un `Map` del proceso. Con
   más de una instancia o con reinicios, las sesiones se pierden. Para publicarlo habría que mover
   ese almacén a Redis o a una tabla, o fijar una sola instancia y asumir el corte en cada deploy.
2. **HTTPS.** La cookie se marca `Secure` con `NODE_ENV=production`; sin HTTPS el navegador la
   descarta y nadie puede iniciar sesión.
3. **Mismo sitio para frontend y API.** La cookie es `SameSite=Strict`: el frontend y `/api` deben
   servirse desde el mismo dominio, con un proxy (Nginx, Caddy o el del proveedor) que mande `/api`
   al backend y el resto al build estático.
4. **Rutas de React.** El servidor de estáticos necesita *fallback* a `index.html` para que
   `/profiles` o `/sessions` funcionen al recargar.
5. **Base de datos.** Crear la base y ejecutar `SQL/rpg.sql` (o `npm run schema:create`) antes del
   primer arranque, y `npm run passwords:migrate` si se importan usuarios viejos con contraseñas en
   texto plano.

## Pasos de un despliegue manual

```bash
# Backend
npm ci
npm run build          # genera dist/
NODE_ENV=production npm start

# Frontend
cd frontend
npm ci
npm run build          # genera frontend/dist/, que sirve el proxy como estático
```

## Qué nunca se sube

- `.env` y cualquier archivo con credenciales (ya está en `.gitignore`).
- Volcados de la base con datos reales.
- `node_modules/`, `dist/`, `test-results/` y demás generados.
