# Copia de seguridad y restauración de la base

Sirve para guardar la base antes de la demostración o de un ensayo y volver exactamente a ese
estado después. Así no dependemos de datos cargados a mano ni de acordarnos qué se tocó.

> **No verificado en esta rama.** Los comandos usan `pg_dump` y `psql`, las herramientas de cliente de
> PostgreSQL, que no estaban instaladas en la máquina donde se migró el proyecto. Probar una copia y una
> restauración sobre una base descartable antes de depender de ellas.

Los ejemplos son para PowerShell en Windows. Necesitan las **herramientas de cliente de PostgreSQL** (no el
servidor): se instalan desde <https://www.postgresql.org/download/windows/> eligiendo solo *Command Line
Tools*. La base vive en Supabase. Las copias automáticas del panel dependen del plan contratado (verificar las
condiciones vigentes), así que acá se usa `pg_dump`, que funciona en cualquier plan.

## Antes de empezar

1. Detener el backend (`Ctrl + C` en la terminal de `npm run dev`) para que nadie escriba durante
   la copia.
2. Guardar las copias **fuera del repositorio**, por ejemplo en `C:\respaldos-rpg`. Un volcado
   contiene los hashes de las contraseñas y los datos de todos: no se versiona ni se comparte.
3. Tener la cadena de conexión del **Session pooler** (la misma de `SUPABASE_DB_URL`) en una variable de
   la sesión de PowerShell, sin escribirla en el comando ni en archivos:

```powershell
New-Item -ItemType Directory -Force C:\respaldos-rpg
$env:PGURL = Read-Host "Cadena de conexion (Session pooler)"
```

`Read-Host` la pide por teclado y no queda en el historial como parte de un comando. Al terminar,
cerrar la terminal o ejecutar `Remove-Item Env:PGURL`.

## Hacer la copia

```powershell
pg_dump $env:PGURL --schema=public --no-owner --no-privileges --clean --if-exists --file="C:\respaldos-rpg\rpg_$(Get-Date -Format yyyyMMdd_HHmm).sql"
```

- `--file` escribe el archivo directamente. **No usar `> archivo.sql`** en PowerShell 5.1: guarda el
  texto en UTF-16 y `psql` no lo puede restaurar.
- `--schema=public` limita el volcado a las tablas de la aplicación y deja fuera los esquemas internos de
  Supabase.
- `--clean --if-exists` hace que el volcado incluya los `DROP` previos, para poder restaurarlo encima de
  una base que ya tiene las tablas.

## Restaurar

La restauración **reemplaza** las tablas de la base de destino por las del archivo. Antes de
restaurar sobre una base con datos que importan, hacerle su propia copia.

1. Detener el backend.
2. Cargar el archivo:

```powershell
psql $env:PGURL --single-transaction --file="C:\respaldos-rpg\rpg_20260924_1800.sql"
```

   `--single-transaction` deshace todo si algo falla a mitad de camino, en lugar de dejar la base a medias.
3. Volver a ejecutar `npm run db:rls`: la restauración recrea las tablas y las deja sin RLS.
4. Volver a levantar el backend (`npm run dev`). Las sesiones abiertas se pierden al reiniciarlo:
   hay que volver a entrar.

## Flujo sugerido para la demostración

1. Base vacía con `npm run schema:create` y `npm run db:rls` (ver [instalacion.md](instalacion.md)).
2. Backend corriendo y `npm run demo:datos` para cargar `dm_demo`, `jugador_demo` y el catálogo
   (ver [demo.md](demo.md#datos-de-demostración)).
3. Hacer la copia: queda el punto de partida de la demo.
4. Ensayar el guion. Al terminar, restaurar la copia y queda todo listo para grabar o presentar.

Esto también resuelve el paso 22 del guion: después de cambiar la contraseña de `dm_demo`, la
restauración la devuelve a `PruebaSegura123`.
