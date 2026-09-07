# Verificación del módulo de Renzo Scollo

Fecha de verificación: 7 de septiembre de 2026.

Rama: `renzo-objeto-frontend`.

Alcance tomado de `plan_desarrollo_5_integrantes.md`: usuarios, autenticación y perfiles.

## Requisitos comprobados

- [x] Registro, login, recuperación de sesión y logout conectados a la API.
- [x] Contraseñas almacenadas con `scrypt`, sal aleatoria y comparación en tiempo constante.
- [x] Las respuestas públicas de usuario no contienen la contraseña.
- [x] Listado, detalle, creación, edición y eliminación real de usuarios desde la interfaz.
- [x] Creación, cambio de estado y eliminación de perfiles propios de Jugador y Anfitrión.
- [x] Los intentos de eliminar perfiles con datos relacionados devuelven un conflicto con un mensaje explicativo.
- [x] La autorización se comprueba en el servidor: una cuenta no puede modificar otra ni crear perfiles para otra identidad.
- [x] Se verifican nickname repetido, credenciales incorrectas, recuperación tras recarga mediante `/auth/me`, logout y cambio de contraseña que invalida sesiones anteriores.
- [x] Existe una migración explícita para contraseñas antiguas; no se ejecuta automáticamente ni se aplicó sobre la base de desarrollo durante esta verificación.

## Matriz aplicada

La matriz completa está documentada en `docs/funcionalidad.md`. Para este módulo:

| Operación | Permiso |
| --- | --- |
| Consultar usuarios y perfiles | Cualquier cuenta autenticada |
| Editar o eliminar un usuario | Solo la propia cuenta |
| Crear otra cuenta desde la gestión de usuarios | Cuenta con perfil de anfitrión |
| Crear, modificar o eliminar un perfil | Solo la cuenta propietaria |
| Modificar karma o cantidad de partidas desde el CRUD | Nadie; se calculan en el servidor |

## Evidencia automática

Los siguientes comandos se ejecutaron correctamente sobre esta revisión:

- Backend: `npm run build`.
- Backend unitario: `npm test` — 52 pruebas aprobadas en 6 archivos.
- Frontend: `npm run build`.
- Frontend estático: `npm run lint`.
- Frontend unitario/componentes: `npm test` — 34 pruebas aprobadas en 8 archivos.
- Integración MySQL: `npm run test:integration` — 17 pruebas aprobadas.

La suite de integración creó una base con nombre aleatorio `rpg_test_<identificador>`, levantó la API contra esa base y la eliminó al terminar. No utilizó `DB_NAME` ni borró la base `rpg`.

## Flujos relevantes cubiertos en MySQL

1. Registrar usuario y perfil en una transacción; comprobar hash y ausencia de contraseña en la respuesta.
2. Repetir nickname y comprobar `409` sin duplicar registros.
3. Iniciar sesión, recuperar identidad por cookie, cerrar sesión y comprobar que la cookie anterior recibe `401`.
4. Intentar modificar una cuenta ajena y comprobar `403`.
5. Editar nombre/nickname propios, listar sin contraseñas y cambiar contraseña invalidando la sesión anterior.
6. Crear el segundo perfil propio, cambiar el estado del jugador y eliminar un perfil sin dependencias.
7. Intentar eliminar un perfil con personajes relacionados y comprobar `409` con mensaje explicativo.
8. Eliminar una cuenta sin dependencias junto con su perfil y comprobar que su sesión deja de ser válida.

Las casillas de recorrido visual/manual general permanecen en `docs/pruebas_manuales.md` para que el equipo registre la verificación conjunta en los navegadores y resoluciones que utilizará en la presentación.
