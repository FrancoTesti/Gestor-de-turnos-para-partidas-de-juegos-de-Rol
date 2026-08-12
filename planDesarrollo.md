# Plan de desarrollo del TP

## Objetivo inmediato

Como somos cinco integrantes y estamos cerca del hito del 14/8, el objetivo del próximo sprint es completar un **CRUD de Usuario de punta a punta**, persistente y demostrable desde el frontend.

El resultado debe permitir:

1. Listar usuarios.
2. Ver el detalle de un usuario.
3. Crear usuarios.
4. Editar usuarios.
5. Eliminar usuarios con confirmación.
6. Mostrar estados de carga, éxito y error.
7. Persistir los cambios realmente en MySQL.

## Regla principal para trabajar en equipo

Cada integrante debe trabajar, en lo posible, en archivos diferentes. En Live Share hay que avisar antes de editar un archivo compartido, especialmente:

- `frontend/src/App.tsx`
- `src/app.ts`
- `package.json`
- `frontend/package.json`

La estructura propuesta para separar responsabilidades es:

```text
frontend/src/
├── components/usuarios/
│   ├── UsuarioLista.tsx
│   ├── UsuarioFormulario.tsx
│   └── UsuarioDetalle.tsx
├── services/
│   └── usuario.service.ts
├── interfaces.ts
└── App.tsx

src/
├── controllers/
├── entities/
├── routes/
├── services/
└── validators/
```

## Reparto inmediato

### Integrante 1 — Backend de Usuario

Responsabilidad: dejar sólida la API existente.

Tareas:

- Revisar la generación de `idUsuario` y definir si será autoincremental.
- Crear tipos para alta y actualización, eliminando el uso de `any`.
- Validar nombre, nickname, contraseña e imagen.
- Impedir que se modifique el ID desde el body.
- Manejar correctamente un nickname duplicado.
- Revisar los códigos HTTP: `201`, `204`, `400`, `404`, `409` y `500`.
- Verificar los cinco endpoints con Postman, Bruno o REST Client.

Archivos principales:

```text
src/controllers/usuario.controller.ts
src/services/usuario.service.ts
src/entities/Usuario.entity.ts
src/validators/usuario.validator.ts
```

Resultado esperado: API completa y probada independientemente del frontend.

### Integrante 2 — Listado y detalle

Responsabilidad: lectura y presentación de usuarios en React.

Tareas:

- Crear `UsuarioLista.tsx`.
- Recibir usuarios mediante props.
- Mostrar nombre, nickname e imagen.
- Manejar una lista vacía.
- Permitir seleccionar un usuario.
- Crear `UsuarioDetalle.tsx`.
- Mostrar estados de carga y error.

Archivos principales:

```text
frontend/src/components/usuarios/UsuarioLista.tsx
frontend/src/components/usuarios/UsuarioDetalle.tsx
```

Los componentes no deben llamar directamente a `fetch`. Las peticiones deben quedar centralizadas en el servicio HTTP y en el componente contenedor.

### Integrante 3 — Formulario de alta y edición

Responsabilidad: formulario reutilizable de Usuario.

Tareas:

- Crear `UsuarioFormulario.tsx`.
- Utilizar el mismo formulario para crear y editar.
- Validar los campos obligatorios antes de enviar.
- Deshabilitar el botón mientras se guarda.
- Mostrar errores debajo de los campos.
- Recibir `usuario`, `onGuardar` y `onCancelar` mediante props.

Archivo principal:

```text
frontend/src/components/usuarios/UsuarioFormulario.tsx
```

En esta etapa no se debe agregar el registro de Jugador o Anfitrión, porque son CRUD dependientes.

### Integrante 4 — Integración del frontend

Responsabilidad: conectar los componentes con la API.

Tareas:

- Importar el servicio de Usuario.
- Cargar los usuarios mediante `useEffect`.
- Integrar el listado, detalle y formulario.
- Ejecutar las operaciones de creación, actualización y eliminación.
- Actualizar el estado después de cada operación.
- Solicitar confirmación antes de eliminar.
- Manejar estados de carga, éxito y error.
- Ser la única persona que modifica `App.tsx` durante la integración.

Archivos principales:

```text
frontend/src/App.tsx
frontend/src/services/usuario.service.ts
```

Esta persona debe esperar a que los integrantes 2 y 3 acuerden y terminen la interfaz pública de sus componentes.

### Integrante 5 — Base de datos, pruebas y documentación

Responsabilidad: asegurar que el proyecto pueda instalarse, ejecutarse y demostrarse.

Tareas:

- Preparar un script SQL reproducible.
- Corregir inconsistencias entre los nombres de tablas y las entidades.
- Crear datos mínimos de prueba.
- Verificar `.env.example`.
- Documentar la instalación y ejecución.
- Preparar una lista de pruebas manuales.
- Probar los tres breakpoints principales del frontend.
- Registrar tareas, responsables y avances en GitHub Projects o Issues.

Archivos principales:

```text
SQL/
README.md
.env.example
docs/
```

Hay una inconsistencia que debe revisarse: la entidad `Clase` usa la tabla `clases`, mientras que el SQL actual inserta datos en `clase`.

## Contratos que deben acordarse antes de programar

El equipo debe acordar cómo se representa un usuario devuelto por la API:

```ts
interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  nickname: string;
  imagen: string;
}
```

La contraseña debe enviarse al crear o actualizar, pero no debería regresar en los listados:

```ts
interface CrearUsuarioData {
  nombreUsuario: string;
  nickname: string;
  contrasena: string;
  imagen: string;
}
```

También deben acordarse las props de los componentes antes de implementarlos:

```tsx
<UsuarioLista
  usuarios={usuarios}
  onSeleccionar={seleccionarUsuario}
  onEditar={editarUsuario}
  onEliminar={eliminarUsuario}
/>
```

```tsx
<UsuarioFormulario
  usuario={usuarioEnEdicion}
  onGuardar={guardarUsuario}
  onCancelar={cancelarEdicion}
/>
```

## Cronograma de dos días

### Día 1 — Flujo funcionando

- Primera hora: acordar contratos, campos y responsables.
- Integrante 1: API y validaciones.
- Integrantes 2 y 3: componentes aislados.
- Integrante 4: carga inicial desde la API.
- Integrante 5: base limpia, datos iniciales y README.
- Fin del día: listar y crear usuarios desde React con persistencia real.

### Día 2 — Calidad e integración

- Integrar edición y eliminación.
- Probar errores y nickname duplicado.
- Probar el comportamiento con el backend apagado.
- Probar el comportamiento con la base de datos apagada.
- Revisar el diseño responsive en SM, MD y LG.
- Ejecutar las verificaciones automáticas.
- Realizar una demostración completa desde una instalación limpia.
- Preparar los pull requests y registrar evidencia del trabajo.

Comandos de verificación:

```powershell
# Desde la raíz: backend
npm.cmd run build

# Desde frontend/
cd frontend
npm.cmd run build
npm.cmd run lint
```

## Flujo Git recomendado

Aunque el equipo trabaje con Live Share, los cambios deben separarse por responsabilidad:

```text
feature/usuario-backend
feature/usuario-listado
feature/usuario-formulario
feature/usuario-integracion
docs/setup-y-pruebas
```

Cada pull request debe:

- Tener un alcance pequeño.
- Indicar cómo se prueba.
- Compilar antes de integrarse.
- Ser revisado por al menos otro integrante.
- Evitar cambios ajenos y formateos masivos.

Orden recomendado de integración:

```text
Backend → Listado → Formulario → Integración → Documentación y pruebas
```

## Trabajo posterior al CRUD de Usuario

Una vez terminado Usuario, se puede repartir un CRUD simple por integrante:

| Integrante | CRUD simple |
|---|---|
| 1 | Usuario |
| 2 | Clase |
| 3 | Objeto |
| 4 | Tienda |
| 5 | Misión |

Se debe utilizar la estructura terminada de Usuario como plantilla para los otros CRUD.

Después deben implementarse los CRUD dependientes en este orden:

1. Jugador depende de Usuario.
2. Anfitrión depende de Usuario.
3. Partida depende de Anfitrión.
4. Personaje depende de Jugador, Clase y Partida.

## Criterio de finalización

El CRUD de Usuario se considera terminado cuando:

- Las cinco operaciones funcionan desde el frontend.
- Los datos persisten en MySQL.
- Los datos recibidos se validan en el backend.
- Los errores se muestran de manera comprensible.
- El backend y el frontend compilan.
- El lint del frontend pasa sin errores.
- El README permite instalar y ejecutar el proyecto.
- Otro integrante puede probar el flujo siguiendo solamente la documentación.

La prioridad no es tener muchas pantallas empezadas, sino completar un CRUD que todo el equipo pueda ejecutar, explicar y defender.