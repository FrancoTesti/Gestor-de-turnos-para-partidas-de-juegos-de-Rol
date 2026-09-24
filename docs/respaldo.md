# Copia de seguridad y restauración de la base

Sirve para guardar la base antes de la demostración o de un ensayo y volver exactamente a ese
estado después. Así no dependemos de datos cargados a mano ni de acordarnos qué se tocó.

Los ejemplos son para PowerShell en Windows con MySQL 8 instalado en la ruta por defecto. Usar
siempre el nombre de base de `DB_NAME` del propio `.env`; en los ejemplos aparece `rpg_desarrollo`.

## Antes de empezar

1. Detener el backend (`Ctrl + C` en la terminal de `npm run dev`) para que nadie escriba durante
   la copia.
2. Guardar las copias **fuera del repositorio**, por ejemplo en `C:\respaldos-rpg`. Un volcado
   contiene los hashes de las contraseñas y los datos de todos: no se versiona ni se comparte.
3. Tener a mano la ruta de las herramientas de MySQL:

```powershell
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
New-Item -ItemType Directory -Force C:\respaldos-rpg
```

`-p` sin valor hace que MySQL pida la contraseña por teclado: no escribirla en el comando, así no
queda en el historial de la terminal.

## Hacer la copia

```powershell
& "$mysqlBin\mysqldump.exe" -u tu_usuario -p --single-transaction --no-tablespaces --default-character-set=utf8mb4 --result-file="C:\respaldos-rpg\rpg_$(Get-Date -Format yyyyMMdd_HHmm).sql" rpg_desarrollo
```

- `--result-file` escribe el archivo directamente. **No usar `> archivo.sql`** en PowerShell 5.1:
  guarda el texto en UTF-16 y MySQL no lo puede restaurar.
- `--single-transaction` toma una foto consistente sin bloquear las tablas.
- El volcado no incluye `CREATE DATABASE`: se puede restaurar en la misma base o en otra con
  otro nombre.

## Restaurar

La restauración **reemplaza** las tablas de la base de destino por las del archivo. Antes de
restaurar sobre una base con datos que importan, hacerle su propia copia.

1. Detener el backend.
2. Si la base de destino no existe, crearla:

```powershell
& "$mysqlBin\mysql.exe" -u tu_usuario -p -e "CREATE DATABASE IF NOT EXISTS rpg_desarrollo CHARACTER SET utf8mb4"
```

3. Cargar el archivo. PowerShell no admite `< archivo.sql`, así que se usa `source` con barras
   normales en la ruta:

```powershell
& "$mysqlBin\mysql.exe" -u tu_usuario -p --default-character-set=utf8mb4 rpg_desarrollo -e "source C:/respaldos-rpg/rpg_20260924_1800.sql"
```

4. Volver a levantar el backend (`npm run dev`). Las sesiones abiertas se pierden al reiniciarlo:
   hay que volver a entrar.

## Flujo sugerido para la demostración

1. Base vacía con `npm run schema:create` (ver [instalacion.md](instalacion.md)).
2. Backend corriendo y `npm run demo:datos` para cargar `dm_demo`, `jugador_demo` y el catálogo
   (ver [demo.md](demo.md#datos-de-demostración)).
3. Hacer la copia: queda el punto de partida de la demo.
4. Ensayar el guion. Al terminar, restaurar la copia y queda todo listo para grabar o presentar.

Esto también resuelve el paso 22 del guion: después de cambiar la contraseña de `dm_demo`, la
restauración la devuelve a `PruebaSegura123`.
