# Seguimiento de cierre del TP

Última actualización: 15 de septiembre de 2026, sobre `a3ac59e` (todos los PR del grupo fusionados en `main`).
Rama de trabajo actual para cuentas, perfiles y documentación: `ramaEmaIteracion2y3`.

Este archivo registra el cierre de la entrega. Una tarea pendiente no se considera cumplida por la sola presencia de código o por un informe anterior.

## Matriz de requisitos

Cada fila enlaza el requisito de `proposal.md` con dónde está implementado y con qué prueba lo
respalda. «E2E» se refiere a `e2e/autenticacion.spec.ts`; «integración», a
`src/integration/juego.test.ts` (ambos contra MySQL real).

### Alcance mínimo

| Requisito | Implementación | Prueba |
| --- | --- | --- |
| CRUD Usuario | `src/routes/usuario.routes.ts`, `frontend/src/pages/UsersPage.tsx` | `src/tests/usuario.service.test.ts`, `usuario.controller.test.ts`, `usuario.schema.test.ts`, `frontend/.../UsersPage.test.tsx` |
| CRUD Objeto | módulo `objeto`, `frontend/src/components/objetos/` | `src/tests/objeto.compra.test.ts`, `objeto.esunico.test.ts`, E2E |
| CRUD Tienda | módulo `tienda`, `frontend/src/pages/TiendasPage.tsx` | `src/tests/tienda.service.test.ts`, `frontend/.../TiendasPage.test.tsx`, E2E |
| CRUD Misión | `juego.service.ts` + `juego.routes.ts`, `frontend/src/pages/MisionesPage.tsx` | `src/tests/juego.service.test.ts`, `frontend/.../MisionesPage.test.tsx`, integración, E2E |
| CRUD Clase | módulo `clase`, `frontend/src/pages/ClasesPage.tsx` | `frontend/.../CargaPaginas.test.tsx`, E2E |
| CRUD Personaje (depende de Jugador) | módulo `personaje`, `frontend/src/pages/PersonajesPage.tsx` | `frontend/.../CargaPaginas.test.tsx`, integración, E2E |
| CRUD Jugador (depende de Usuario) | módulo `jugador`, `frontend/src/pages/ProfilesPage.tsx` | `frontend/.../ProfilesPage.test.tsx`, E2E |
| CRUD Anfitrión (depende de Usuario) | módulo `anfitrion`, `frontend/src/pages/ProfilesPage.tsx` | `frontend/.../ProfilesPage.test.tsx`, E2E |
| Listado de partidas activas con detalle | `GET /api/partidas/activas`, `ModulePage` con recurso `partidas` | integración, E2E |
| Listado de objetos sugeridos por clase | `GET /api/objetos/sugeridos/:idPersonaje` y `/sugeridos/clase/:idClase` | `src/tests/objeto.esunico.test.ts`, integración |
| Listado de personajes por clase, con filtro que se puede limpiar | `GET /api/personajes?idClase=`, `PersonajesPage.tsx` | `frontend/.../CargaPaginas.test.tsx`, E2E |
| CUU Jugar una sesión | `JuegoService.play/finish`, `SesionesPage.tsx` | `src/tests/juego.service.test.ts`, integración, E2E |
| CUU Gestionar comercialización de objetos | `ObjetoService`, `JuegoService.sell`, `venta.rules.ts` | `objeto.compra.test.ts`, `venta.rules.test.ts`, integración, E2E |
| CUU Realizar misión | `JuegoService.completeMission` | `juego.service.test.ts`, integración, E2E |

### Adicionales para aprobación

| Requisito | Implementación | Prueba |
| --- | --- | --- |
| CRUD Partida | módulo `partida`, `ModulePage` recurso `partidas` | integración, E2E |
| CRUD Sesión | `juego.routes.ts`, `SesionesPage.tsx` | `frontend/.../SesionesPage.test.tsx`, integración, E2E |
| CRUD Inventario | `juego.routes.ts`, `ModulePage` recurso `inventarios` | integración, E2E |
| CUU Gestionar inventario (mover objetos) | `JuegoService.moveObject` | integración, E2E |
| CUU Calificar anfitrión | `JuegoService.rate` | `juego.service.test.ts`, integración, E2E |
| CUU Crear personaje | `PersonajeService` (personaje + inventario en una transacción) | integración, E2E |
| CUU Gestionar partida | `PartidaService`, permisos de `authorizeCrud` | integración, E2E |
| CUU Actualizar usuario | `UsuarioService.actualizarUsuario`, `UsersPage.tsx`, `ProfilesPage.tsx` | `usuario.service.test.ts`, `UsersPage.test.tsx`, `ProfilesPage.test.tsx` |

### Requisitos transversales

| Requisito | Estado | Evidencia |
| --- | --- | --- |
| Autenticación con contraseñas hasheadas y sesión recuperable | Cerrado | `src/tests/auth.cuentas.test.ts`, `seguridad.test.ts`, E2E |
| Permisos comprobados en el servidor, no ocultando botones | Cerrado | `authorizeCrud`, pruebas de integración por rol |
| Transacciones y concurrencia en MySQL | Cerrado | `src/integration/juego.test.ts`, `objeto.compra.test.ts` |
| Integración continua con build, lint y pruebas | Cerrado | `.github/workflows/verificacion.yml` |
| Documentación de instalación, API, modelo y demo | Cerrado | `docs/README.md` y los documentos que enlaza |
| Revisión responsive y de accesibilidad completa | Parcial | Revisadas las pantallas de cuentas, perfiles, clases, tiendas y personajes; falta recorrer el resto en pantalla chica |
| Alcance adicional voluntario | No iniciado | Decisión del grupo: se priorizó cerrar el alcance de aprobación |

## Cuentas, perfiles y documentación (Emanuel Salomón)

- El registro avisa con un mensaje propio cuando el nickname ya existe, en vez del texto genérico de
  la restricción única, tanto si lo detecta antes de insertar como si la colisión aparece al guardar.
- El registro pide repetir la contraseña y valida longitudes antes de enviar, sin reemplazar la
  validación del servidor.
- Login y registro tienen etiquetas asociadas a cada campo, `autocomplete` y estados de envío.
- «Mis perfiles» muestra los datos de la cuenta, permite editarlos (incluida la contraseña, que
  cierra la sesión) y administra los perfiles de jugador y anfitrión con sus mensajes de error.
- `frontend/src/services/anfitrion.service.ts` estaba vacío: se completó y las pantallas de perfiles
  pasan por los servicios en lugar de armar las rutas a mano.
- Se eliminó `frontend/src/mockData.ts`, que ya no importaba ninguna pantalla y todavía guardaba
  usuarios de prueba con contraseñas en texto plano, junto con el ayudante `simularRetardo`.
- Documentación nueva: índice `docs/README.md`, referencia de API `docs/api.md`, modelo vigente
  `docs/modelo.md`, guion de demostración `docs/demo.md` y despliegue `docs/despliegue.md`.
  `proposal.md` y `README.md` quedaron con enlaces reales y la lista completa de comandos.

### Semana del 17 al 23 de septiembre

Hecho (rama `ramaEmaIteracion4`):

- Datos de demostración reproducibles: `npm run demo:datos` crea `dm_demo`, `jugador_demo`, dos
  clases, dos tiendas y cuatro objetos (uno único) a través de la API. Probado contra una base
  MySQL descartable: la primera ejecución crea todo, la segunda no duplica nada y con el backend
  apagado falla con un mensaje claro. Documentado en [demo.md](demo.md#datos-de-demostración).
- Copia de seguridad y restauración con `mysqldump`/`mysql`: [respaldo.md](respaldo.md). Probado
  contra bases descartables: volcado, restauración en otra base y restauración encima de una base
  modificada, con login de `dm_demo` sobre la base restaurada.
- `docs/api.md` contrastado contra `src/routes/`, controladores, servicios y validadores: se
  corrigieron 12 diferencias y se agregaron los códigos que faltaban. El detalle está en
  [seguimiento.md](seguimiento.md).
- Defecto corregido: un cuerpo de más de 64 KB respondía 500; ahora responde 413 con un mensaje
  que la pantalla muestra tal cual. Prueba en `src/tests/errores.test.ts`.
- Nuevos [seguimiento.md](seguimiento.md) (funcionalidades y defectos) y [minutas.md](minutas.md)
  (plantilla; las minutas las carga el grupo).

Pendiente, a cargo de una persona:

- Checklist manual de cuentas y perfiles en [pruebas_manuales.md](pruebas_manuales.md).
- Grabar el video siguiendo [demo.md](demo.md) y pegar el enlace acá.
- Registrar las minutas de las reuniones de la semana.

## Enlaces a los PR del grupo

| PR | Autor | Contenido |
| --- | --- | --- |
| [#34](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/34) | Renzo Scollo | Reparación del build del frontend y de la calificación de sesiones |
| [#33](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/33) | Renzo Scollo | Calidad del frontend, recorridos E2E y CI |
| [#32](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/32) | Franco Testi | Flujo completo de partidas, sesiones y misiones |
| [#31](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/31) | Grupo | Integración de los cambios del 9 de septiembre |
| [#30](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/30) | Renzo Scollo | Corrección de la compilación del frontend |
| [#29](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/29) | Octavio Gudiño | Objetos, tiendas, compra, venta e inventarios |
| [#28](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/28) | Alejandro Ciesco | Clases, personajes y acceso a partidas |
| [#27](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/27) | Franco Testi | Sesiones, participantes y calificación del anfitrión |
| [#26](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/26) y [#25](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/pull/25) | Renzo Scollo | Autenticación, permisos y pantallas conectadas |

Al abrir un PR nuevo hay que sumarlo a esta tabla.

## Automatización

`.github/workflows/verificacion.yml` ejecuta compilación, tests y lint del frontend, además de compilación, tests unitarios e integración MySQL del backend. La base del servicio CI es efímera; la suite crea y elimina exclusivamente su propia base aleatoria. La contraseña declarada en el workflow pertenece solo a ese servicio de prueba.

La ejecución [Actions 34906172625](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/34906172625) aprobó los dos trabajos completos: el de frontend compiló, ejecutó lint y las 52 pruebas; el de backend compiló, ejecutó las 76 pruebas unitarias, las 19 de integración MySQL y los recorridos E2E en Chromium. Las acciones del workflow se actualizaron a las versiones con soporte de Node 24, por lo que ya no aparece la deprecación de Node 20.

El árbol del repositorio tenía un enlace de submodule `temp_repo` sin entrada en `.gitmodules`, así que la limpieza del checkout informaba `fatal: No url found for submodule path 'temp_repo'`. No rompía ninguna etapa, pero impedía clonar con submodules. Se eliminó el enlace porque no tiene URL, no tiene contenido y ningún archivo del proyecto lo referencia.

## Reparación del main tras los merges del 14/9

La combinación de los PR #31, #32 y #33 dejó `main` sin compilar. La reparación corrigió:

- Importaciones de tipos en `MisionesPage.tsx` y `SesionesPage.tsx`, que `verbatimModuleSyntax` rechazaba y que en el navegador impedían cargar la aplicación completa.
- Comparaciones imposibles en `ModulePage.tsx` contra recursos `sesiones` y `misiones` que ya no administra, con el código y el estado asociados eliminados.
- La calificación del anfitrión: el servicio enviaba `karma` y el backend exige `valor` con `-1` o `1`, por lo que toda calificación fallaba con `400`. La interfaz ahora ofrece buena o mala experiencia y muestra el resultado en pantalla.
- El aviso por posición ocupada al mover un objeto, que antes se guardaba en un estado que no se dibujaba.
- Los dos avisos de lint de las pantallas nuevas, reemplazando la recarga por un contador de revisión.
- La columna Descripción en el listado de misiones, que antes no permitía distinguir una misión de otra.

Los recorridos de navegador se actualizaron a la interfaz vigente de sesiones y misiones. Verificación local tras la reparación: backend compila con 76 pruebas unitarias y 19 de integración; frontend compila, sin avisos de lint y con 51 pruebas; 4 recorridos E2E aprobados.

## Comunicación HTTP

Los servicios de usuarios, jugadores y partidas ya utilizan `api.ts`. Una búsqueda de `fetch(` en `frontend/src` encuentra únicamente el cliente común.

Una respuesta protegida `401` notifica al contexto, que limpia identidad, usuarios y perfiles. El layout protegido existente redirige al login al perder la identidad. Un rechazo de contraseña al iniciar sesión no dispara esa notificación. Las recargas de listas iniciadas antes de limpiar la sesión no vuelven a introducir datos privados.

El cliente también identifica errores de conexión sin reintentar escrituras, admite respuestas `204` y conserva el estado HTTP ante cuerpos de error inesperados. La prueba de contexto verifica la limpieza de identidad y listas ante un `401` del cliente real, y el primer recorrido de navegador comprueba que ese `401` termina en el login al intentar volver a una ruta privada.

## Carga de pantallas y perfiles combinados

Las cargas iniciales de clases, tiendas y personajes usan su estado inicial de carga; los reintentos se solicitan desde eventos y descartan respuestas de efectos anteriores o pantallas desmontadas. Se eliminaron las tres advertencias de React sin desactivar reglas de lint.

Personajes comprueba la existencia del perfil jugador independientemente del perfil anfitrión. Antes, una cuenta con ambos perfiles no veía la opción de crear personajes.

Verificación local: compilación correcta, 52 pruebas aprobadas y lint sin errores ni advertencias. Las nuevas pruebas cubren reintentos después de fallos de conexión en las tres páginas y creación de personajes con perfiles combinados.

## Rutas inexistentes

`App.tsx` ya no envía cualquier dirección desconocida al dashboard. La ruta comodín muestra `NotFoundPage`, que informa la dirección solicitada y ofrece volver al dashboard si hay sesión o ir al login si no la hay. Está cubierta por una prueba de componente y por un recorrido de navegador.

## Pruebas de navegador

Cuatro recorridos locales aprobados con Chromium, Express y MySQL reales, sin reemplazar las respuestas de la API:

- Registro de anfitrión, login, creación de partida y sesión planificada, persistencia después de recargar, invalidación de cookie y redirección al login ante un `401`.
- Cierre de sesión desde el botón y bloqueo del acceso posterior a una ruta privada.
- Dos cuentas separadas: el anfitrión crea clase y partida; el jugador crea su personaje; el anfitrión inicia una sesión con ese participante, completa una misión con 50 XP y 100 monedas, finaliza la sesión y recibe karma +1 del jugador. Se verifica que no se ofrece completar de nuevo la misión y que el personaje conserva 50 XP y 200 monedas tras recargar.
- Dentro del tercer recorrido se crea una tienda y un objeto de valor 40, se compra (saldo 160), se crea un segundo inventario y se mueve el objeto a su posición 2. Luego se vende por 28 (70 %), se comprueba que sale del inventario y que el saldo persistido queda en 188.
- Una dirección inexistente con sesión iniciada muestra la página de error, conserva la ruta en la barra y permite volver al dashboard.

El recorrido positivo de juego y comercio queda comprobado. Esto no demuestra todos los permisos ni todas las variantes de negocio: deben contrastarse también con las pruebas unitarias, de integración y la matriz de requisitos pendiente. Tampoco sustituye la revisión responsive y de accesibilidad.

Para repetirlos desde la raíz:

```powershell
npm ci
npm --prefix frontend ci
npx playwright install chromium
$env:TEST_DB_HOST = '127.0.0.1'
$env:TEST_DB_PORT = '3306'
$env:TEST_DB_USER = 'usuario_de_pruebas'
# Definir TEST_DB_PASSWORD en el entorno local, sin subirla al repositorio.
npm run test:e2e
```

El usuario de MySQL necesita permiso para crear y eliminar bases de prueba. La suite exige `TEST_DB_PORT` explícito, crea una base `rpg_e2e_<identificador aleatorio>` y elimina únicamente esa base al finalizar, incluso ante fallos de pruebas. Nunca reutiliza `DB_NAME`. Un corte forzado del proceso puede impedir la limpieza: revisar cualquier base residual antes de eliminarla manualmente.

Los puertos 5174 y 3101 deben estar libres. El preparador E2E levanta Vite dentro del mismo proceso, con la raíz `frontend/`, y redirige `/api` al backend de prueba en `127.0.0.1:3101`; por eso no depende del `webServer` de Playwright ni de `API_PROXY_TARGET`. Al ejecutar la aplicación a mano, Vite conserva su destino habitual `localhost:3000` o el que indique `API_PROXY_TARGET`. Las capturas y trazas de fallos quedan en `test-results/`, excluido de Git.

## Evidencia de verificación local (15/9/2026)

Ejecutado sobre `ramaEmaIteracion2y3`, con dependencias instaladas mediante `npm ci` en la raíz y en
`frontend/`:

| Comando | Resultado |
| --- | --- |
| `npm run build` (backend) | Compila sin errores |
| `npm test` (backend) | 11 archivos, **83 pruebas aprobadas** (76 previas + 7 nuevas de cuentas y sesión) |
| `npm run build` (frontend) | Compila sin errores |
| `npm run lint` (frontend) | Sin errores ni advertencias |
| `npm test` (frontend) | 17 archivos, **61 pruebas aprobadas** (51 previas + 10 nuevas de perfiles y registro) |

Pruebas nuevas incorporadas en esta tanda:

- `src/tests/auth.cuentas.test.ts` — registro sin devolver la contraseña y con hash scrypt, nickname
  repetido detectado antes y durante el guardado, contraseña corta, login/`/me`/logout con cookie y
  mismo mensaje para credenciales incorrectas. Monta el router real de autenticación sobre un
  `EntityManager` simulado, así que no necesita MySQL.
- `frontend/src/pages/__tests__/RegisterPage.test.tsx` — alta de jugador y de anfitrión, contraseñas
  que no coinciden, longitud mínima y rechazo del servidor por nickname repetido.
- `frontend/src/pages/__tests__/ProfilesPage.test.tsx` — datos propios, alta y baja de cada perfil,
  karma calculado por el servidor, edición sin enviar el identificador y cierre de sesión al cambiar
  la contraseña.

**Lo que no se pudo ejecutar en esta máquina:** `npm run test:integration` y `npm run test:e2e`
necesitan un MySQL local, que acá no está instalado. La última corrida verde de ambos es la de
Actions citada más abajo. Antes de la entrega hay que volver a ejecutarlos, porque el recorrido E2E
de registro se actualizó para completar el campo «Repetir contraseña» que ahora pide la pantalla.

## Semana del 17 al 23 de septiembre (Renzo Scollo)

Trabajo transversal de calidad. Todo lo de esta sección se ejecutó contra MySQL real y quedó en la
rama `renzo/semana-17-23`.

| Tarea | Resultado |
| --- | --- |
| Recorrido responsive en 375, 768 y 1280 px | `e2e/responsive.spec.ts`: 12 pantallas privadas × 3 anchos + login y registro en 375, con 38 capturas |
| Revisión de accesibilidad | `e2e/accesibilidad.spec.ts`: axe-core con WCAG 2.0 A/AA en 13 pantallas, sin violaciones graves |
| Recorridos negativos | `e2e/rechazos.spec.ts`: reparto con suma incorrecta, segunda sesión en curso, misión repetida, autocalificación y doble calificación |
| Plantilla de PR | `.github/pull_request_template.md` con la lista de verificación que incluye el run de Actions en verde |
| Cobertura de pruebas | `npm run test:coverage` en backend y frontend, con umbrales publicados como artefacto en Actions |
| Verificador de enlaces | `npm run docs:check` recorre los `.md` y falla si un enlace relativo quedó roto |
| Mensajes de error | Se eliminaron dos `catch` que solo escribían en consola (`PartidaFormulario`, `PersonajeFormulario`) |

Los cuatro defectos de presentación corregidos y sus causas están en
[evidencia_calidad_visual.md](evidencia_calidad_visual.md): la grilla del dashboard, las tablas
anchas de tiendas, sesiones y misiones, el ancho de los formularios de juego y varios contrastes que
no llegaban a 4.5:1. En accesibilidad se corrigió un `select` sin nombre y una tarjeta de clase con
controles anidados.

Los umbrales de cobertura arrancan en el valor real medido el 21/9/2026 (backend: 30 % de líneas,
35 % de funciones; frontend: 47 % de líneas, 36 % de funciones). Son un freno contra regresiones, no
un objetivo de calidad: las pruebas de integración cubren buena parte del backend y todavía no
reportan cobertura. Subirlos es trabajo pendiente del grupo.
